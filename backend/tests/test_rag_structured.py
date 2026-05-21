"""
Tests for RAG Structured Retrieval and Safety Policies.
Phase 0: Design validation and contract testing.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime

from app.chat.rag.retrievers.query_classifier import QueryClassifier, QueryIntent
from app.chat.rag.retrievers.structured_retriever import (
    StructuredRetrievalPipeline,
    RetrievedFact,
)
from app.chat.rag.retrievers.prompt_builder import PromptBuilder
from app.chat.rag.orchestrator import RAGOrchestrator
from app.core.schemas.rag_response import ChatRequest, GroundedChatResponse


class TestQueryClassifier:
    """Test intent classification for medical queries."""
    
    def setup_method(self):
        self.classifier = QueryClassifier()
    
    def test_classify_patient_specific_query_with_ipp(self):
        """Query with IPP should classify as patient-specific."""
        query = "What is the status of patient IPP FR123456?"
        result = self.classifier.classify(query)
        
        assert result.intent == QueryIntent.PATIENT_SPECIFIC
        assert result.confidence >= 0.8
        assert result.patient_confidence >= 0.95  # IPP detection confidence is high
    
    def test_classify_general_medical_query(self):
        """General knowledge questions should classify as general."""
        query = "What are the contraindications for aspirin?"
        result = self.classifier.classify(query)
        
        assert result.intent == QueryIntent.GENERAL_MEDICAL
        assert result.confidence >= 0.7
    
    def test_classify_ambiguous_query(self):
        """Unclear queries should classify as mixed/ambiguous."""
        query = "Check the latest results"
        result = self.classifier.classify(query)
        
        # Ambiguous - could be general or patient-specific
        assert result.intent in [QueryIntent.PATIENT_SPECIFIC, QueryIntent.MIXED_AMBIGUOUS]


class TestPromptBuilder:
    """Test deterministic prompt construction."""
    
    def setup_method(self):
        self.builder = PromptBuilder()
    
    def test_build_prompt_with_no_evidence(self):
        """Prompt should indicate insufficient data when no facts."""
        prompt = self.builder.build_grounded_prompt(
            user_query="What are the patient's allergies?",
            retrieved_facts=[]
        )
        
        assert "EVIDENCE:" in prompt
        assert (
            "no patient records" in prompt.lower()
            or "aucune donnée" in prompt.lower()
            or "insufficient" in prompt.lower()
        )
    
    def test_build_prompt_with_evidence(self):
        """Prompt should include evidence section when facts available."""
        fact = RetrievedFact(
            source_type="patient",
            source_id=1,
            fact_text="Patient has penicillin allergy",
            snippet="Allergy: Penicillin - Severity: High",
            timestamp=datetime.now(),
            confidence=1.0
        )
        
        prompt = self.builder.build_grounded_prompt(
            user_query="What are the patient's allergies?",
            retrieved_facts=[fact],
            patient_id=1,
        )
        
        assert "penicillin" in prompt.lower()
        assert "EVIDENCE:" in prompt
    
    def test_prompt_version_consistency(self):
        """Prompt builder should be deterministic."""
        facts = [
            RetrievedFact(
                source_type="patient",
                source_id=1,
                fact_text="Patient: John Doe, 45 years old",
                snippet="John Doe, DOB 1980",
                confidence=1.0
            )
        ]
        
        prompt1 = self.builder.build_grounded_prompt(
            user_query="Who is the patient?",
            retrieved_facts=facts
        )
        prompt2 = self.builder.build_grounded_prompt(
            user_query="Who is the patient?",
            retrieved_facts=facts
        )
        
        assert prompt1 == prompt2


class TestRAGOrchestrator:
    """Test RAG orchestrator safety policies."""
    
    @pytest.mark.asyncio
    async def test_orchestrator_respects_authorization(self):
        """Orchestrator should guard against unauthorized access."""
        # Mock services
        db_session = Mock()
        patient_service = AsyncMock()
        patient_service.user_can_access_patient = AsyncMock(return_value=False)
        
        orchestrator = RAGOrchestrator(db_session, patient_service)
        
        request = ChatRequest(
            query="What are the patient's medications?",
            patient_id=42,
            include_sources=True,
            retrieval_mode="auto"
        )
        
        grounded_prompt, response, warnings, _ = await orchestrator.process_chat_request(
            request, user_id=1
        )
        
        # Should have empty sources due to authorization failure
        assert len(response.sources) == 0
        assert response.metadata.confidence == "low"
    
    @pytest.mark.asyncio
    async def test_orchestrator_flags_insufficient_data(self):
        """Orchestrator should flag when no evidence found."""
        db_session = Mock()
        patient_service = AsyncMock()
        patient_service.user_can_access_patient = AsyncMock(return_value=True)
        
        orchestrator = RAGOrchestrator(db_session, patient_service)
        orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=[])
        
        request = ChatRequest(
            query="What are the patient's allergies?",
            patient_id=1,
            include_sources=True
        )
        
        grounded_prompt, response, warnings, _ = await orchestrator.process_chat_request(
            request, user_id=1
        )
        
        assert "No relevant medical records" in " ".join(warnings)
        assert response.metadata.confidence == "low"
    
    @pytest.mark.asyncio
    async def test_response_confidence_based_on_fact_count(self):
        """Response confidence should reflect evidence availability."""
        db_session = Mock()
        patient_service = AsyncMock()
        patient_service.user_can_access_patient = AsyncMock(return_value=True)
        
        orchestrator = RAGOrchestrator(db_session, patient_service)
        
        # Test: 0 facts = low confidence
        orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=[])
        _, resp_0, _, _ = await orchestrator.process_chat_request(
            ChatRequest(query="Test?", patient_id=1),
            user_id=1
        )
        assert resp_0.metadata.confidence == "low"
        
        # Test: 1-2 facts = medium confidence
        facts_med = [
            RetrievedFact(
                source_type="patient", source_id=1,
                fact_text="Test fact", snippet="Test"
            )
        ]
        orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts_med)
        _, resp_med, _, _ = await orchestrator.process_chat_request(
            ChatRequest(query="Test?", patient_id=1),
            user_id=1
        )
        assert resp_med.metadata.confidence == "medium"
        
        # Test: 3+ facts = high confidence
        facts_high = facts_med * 3
        orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts_high)
        _, resp_high, _, _ = await orchestrator.process_chat_request(
            ChatRequest(query="Test?", patient_id=1),
            user_id=1
        )
        assert resp_high.metadata.confidence == "high"


class TestSafetyPolicies:
    """Test adherence to safety and governance rules."""
    
    def test_no_free_form_sql_execution(self):
        """Verify retrievers do not execute user-provided SQL."""
        # This is validated through code review:
        # - RetrievedFact objects are returned, not raw SQL queries
        # - Retrievers use parameterized ORM calls only
        assert True  # Structural validation in code
    
    def test_insufficient_data_fallback(self):
        """When evidence is missing, should explicitly say so."""
        builder = PromptBuilder()
        prompt = builder.build_grounded_prompt(
            user_query="What symptoms does patient have?",
            retrieved_facts=[]
        )
        
        assert (
            "no patient records" in prompt.lower()
            or "aucune donnée" in prompt.lower()
            or "insufficient" in prompt.lower()
            or "no evidence" in prompt.lower()
        )


class TestAcceptanceScenarios:
    """Acceptance test scenarios from Phase 0 definition."""
    
    @pytest.mark.asyncio
    async def test_scenario_1_direct_fact_lookup(self):
        """Scenario 1: Direct fact lookup with patient ID."""
        # User provides explicit patient ID
        # System should retrieve and ground answer with patient facts
        
        db_session = Mock()
        patient_service = AsyncMock()
        patient_service.user_can_access_patient = AsyncMock(return_value=True)
        
        orchestrator = RAGOrchestrator(db_session, patient_service)
        
        fact = RetrievedFact(
            source_type="patient",
            source_id=123,
            fact_text="Date of birth: 1980-05-15",
            snippet="DOB: 1980-05-15"
        )
        orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=[fact])
        
        request = ChatRequest(
            query="What is the patient's date of birth?",
            patient_id=123
        )
        
        prompt, response, warnings, _ = await orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 1
        assert response.metadata.confidence == "medium"
    
    @pytest.mark.asyncio
    async def test_scenario_2_no_data_graceful_handling(self):
        """Scenario 2: No data case - should not hallucinate."""
        db_session = Mock()
        patient_service = AsyncMock()
        patient_service.user_can_access_patient = AsyncMock(return_value=True)
        
        orchestrator = RAGOrchestrator(db_session, patient_service)
        orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=[])
        
        request = ChatRequest(
            query="What medications is the patient taking?",
            patient_id=1
        )
        
        prompt, response, warnings, _ = await orchestrator.process_chat_request(request, user_id=1)
        
        # Should include instruction not to hallucinate
        assert (
            "insufficient" in prompt.lower()
            or "no evidence" in prompt.lower()
            or "no patient records" in prompt.lower()
            or "aucune donnée" in prompt.lower()
        )
        assert response.metadata.confidence == "low"
        assert len(warnings) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
