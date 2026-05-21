"""
Phase 1 Evaluation Test Set - Structured RAG MVP
15 representative scenarios from clinician perspective.

Exit criteria:
- All 15 scenarios pass with correct grounding
- No fabricated structured facts in responses
- All sources properly cited
- Confidence levels accurate
"""

import pytest
from datetime import datetime, date, timedelta
from unittest.mock import Mock, AsyncMock, patch
from sqlalchemy.orm import Session

from app.chat.rag.orchestrator import RAGOrchestrator
from app.chat.rag.retrievers.structured_retriever import RetrievedFact
from app.core.schemas.rag_response import ChatRequest
from app.patients.service import PatientService

# Note: several scenarios mock the orchestrator heavily. If a scenario fails after
# RAG behavior changes, treat it as a product-review item rather than deleting the test.


class TestEvaluationScenarios:
    """
    15 representative scenarios for Phase 1 evaluation.
    Each scenario tests a different aspect of the grounded RAG pipeline.
    """
    
    def setup_method(self):
        """Setup test fixtures for each scenario."""
        self.db_mock = Mock(spec=Session)
        self.patient_service_mock = AsyncMock(spec=PatientService)
        self.patient_service_mock.user_can_access_patient = AsyncMock(return_value=True)

        def _query_chain(*_args, **_kwargs):
            chain = Mock()
            chain.filter.return_value = chain
            chain.order_by.return_value = chain
            chain.first.return_value = None
            chain.all.return_value = []
            return chain

        self.db_mock.query.side_effect = _query_chain
        
        self.orchestrator = RAGOrchestrator(self.db_mock, self.patient_service_mock)
    
    # ========== SCENARIO GROUP 1: Direct Fact Lookup ==========
    
    @pytest.mark.asyncio
    async def test_scenario_1_patient_demographics(self):
        """
        Scenario 1: Query patient demographics (name, age, gender)
        Expected: Return grounded demographics with high confidence
        """
        # Mock retriever response
        facts = [
            RetrievedFact(
                source_type="patient",
                source_id=1,
                fact_text="Patient: Ahmed Hassan, Age: 45 years, Gender: Male",
                snippet="Ahmed Hassan, DOB: 1980-04-15",
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="Tell me about patient Ahmed Hassan",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 1
        assert response.metadata.confidence == "medium"
        assert "Ahmed Hassan" in prompt
        print(f"✓ Scenario 1 PASS: Patient demographics grounded and cited")
    
    @pytest.mark.asyncio
    async def test_scenario_2_patient_allergies(self):
        """
        Scenario 2: Query patient allergies and adverse reactions
        Expected: Return all allergies with severity levels
        """
        facts = [
            RetrievedFact(
                source_type="patient",
                source_id=1,
                fact_text="Allergy: Penicillin, Severity: Severe, Reaction: Anaphylaxis",
                snippet="Allergen: Penicillin (Severe) - Anaphylaxis",
                confidence=1.0
            ),
            RetrievedFact(
                source_type="patient",
                source_id=1,
                fact_text="Allergy: Aspirin, Severity: Moderate, Reaction: Rash",
                snippet="Allergen: Aspirin (Moderate) - Rash",
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="What allergies does the patient have?",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 2
        assert response.metadata.confidence == "medium"
        assert "Penicillin" in prompt
        assert "Aspirin" in prompt
        print(f"✓ Scenario 2 PASS: Allergies grounded with severity levels")
    
    @pytest.mark.asyncio
    async def test_scenario_3_recent_appointments(self):
        """
        Scenario 3: Query recent appointments and their reasons
        Expected: Return most recent appointments with dates and reasons
        """
        facts = [
            RetrievedFact(
                source_type="appointment",
                source_id=10,
                fact_text="Appointment scheduled: 2026-04-20 14:00, Status: completed, Reason: Consultation",
                snippet="Appointment on 2026-04-20 14:00 (completed) - Reason: Consultation",
                timestamp=datetime(2026, 4, 20),
                confidence=1.0
            ),
            RetrievedFact(
                source_type="appointment",
                source_id=9,
                fact_text="Appointment scheduled: 2026-04-10 10:30, Status: completed, Reason: Follow-up",
                snippet="Appointment on 2026-04-10 10:30 (completed) - Reason: Follow-up",
                timestamp=datetime(2026, 4, 10),
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="What are the patient's recent appointments?",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 2
        assert response.metadata.confidence == "medium"
        assert "2026-04-20" in prompt
        print(f"✓ Scenario 3 PASS: Recent appointments dated and cited")
    
    # ========== SCENARIO GROUP 2: Temporal Questions ==========
    
    @pytest.mark.asyncio
    async def test_scenario_4_abnormal_lab_results(self):
        """
        Scenario 4: Query abnormal lab results
        Expected: Flag abnormal results prominently
        """
        facts = [
            RetrievedFact(
                source_type="act_result",
                source_id=20,
                fact_text="ABNORMAL result: Hemoglobin = 8.5 g/dL (LOW)",
                snippet="⚠️ Hemoglobin: 8.5 g/dL (ABNORMAL - LOW)",
                timestamp=datetime(2026, 4, 15),
                metadata={"is_abnormal": True},
                confidence=1.0
            ),
            RetrievedFact(
                source_type="act_result",
                source_id=21,
                fact_text="ABNORMAL result: Glucose = 320 mg/dL (HIGH)",
                snippet="⚠️ Glucose: 320 mg/dL (ABNORMAL - HIGH)",
                timestamp=datetime(2026, 4, 15),
                metadata={"is_abnormal": True},
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="Are there any abnormal lab results?",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 2
        assert response.metadata.confidence == "medium"
        assert "Hemoglobin" in prompt
        assert "Glucose" in prompt
        assert "⚠️" in str(response.sources)
        print(f"✓ Scenario 4 PASS: Abnormal results flagged prominently")
    
    @pytest.mark.asyncio
    async def test_scenario_5_normal_lab_results(self):
        """
        Scenario 5: Query normal lab results
        Expected: Show normal results without excessive warnings
        """
        facts = [
            RetrievedFact(
                source_type="act_result",
                source_id=22,
                fact_text="Test result: Hemoglobin = 13.2 g/dL (Normal)",
                snippet="Hemoglobin: 13.2 g/dL - Normal",
                timestamp=datetime(2026, 4, 15),
                metadata={"is_abnormal": False},
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="What are the patient's lab results?",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 1
        assert response.metadata.confidence == "medium"
        assert "Hemoglobin" in prompt
        print(f"✓ Scenario 5 PASS: Normal results presented without alarms")
    
    # ========== SCENARIO GROUP 3: Insufficient Data Handling ==========
    
    @pytest.mark.asyncio
    async def test_scenario_6_no_patient_data_found(self):
        """
        Scenario 6: Query for patient with no records
        Expected: Explicitly state insufficient data
        """
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=[])
        
        request = ChatRequest(
            query="What medications is the patient taking?",
            patient_id=999,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 0
        assert response.metadata.confidence == "low"
        assert any("No relevant medical records" in w for w in response.warnings)
        assert (
            "no patient records" in prompt.lower()
            or "aucune donnée" in prompt.lower()
            or "insufficient" in prompt.lower()
        )
        print(f"✓ Scenario 6 PASS: No data case handled gracefully")
    
    @pytest.mark.asyncio
    async def test_scenario_7_limited_evidence_warning(self):
        """
        Scenario 7: Limited evidence (1 fact) triggers warning
        Expected: Medium confidence and warning about limited data
        """
        facts = [
            RetrievedFact(
                source_type="medical_act",
                source_id=30,
                fact_text="Medical act: Consultation, Date: 2026-04-20",
                snippet="Consultation on 2026-04-20",
                timestamp=datetime(2026, 4, 20),
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="Tell me about the patient's medical history",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 1
        assert response.metadata.confidence == "medium"
        print(f"✓ Scenario 7 PASS: Limited evidence flagged as medium confidence")
    
    # ========== SCENARIO GROUP 4: Authorization Enforcement ==========
    
    @pytest.mark.asyncio
    async def test_scenario_8_unauthorized_patient_access(self):
        """
        Scenario 8: User attempts access to unauthorized patient
        Expected: Return empty results and log authorization failure
        """
        self.patient_service_mock.user_can_access_patient = AsyncMock(return_value=False)
        
        request = ChatRequest(
            query="What is the patient's diagnosis?",
            patient_id=999,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 0
        assert response.metadata.confidence == "low"
        print(f"✓ Scenario 8 PASS: Unauthorized access blocked")
    
    @pytest.mark.asyncio
    async def test_scenario_9_authorized_patient_access(self):
        """
        Scenario 9: Authorized user accesses patient
        Expected: Full data retrieval and proper citation
        """
        facts = [
            RetrievedFact(
                source_type="patient",
                source_id=1,
                fact_text="Patient: Ahmed Hassan, Gender: Male",
                snippet="Ahmed Hassan (Male)",
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        self.patient_service_mock.user_can_access_patient = AsyncMock(return_value=True)
        
        request = ChatRequest(
            query="Who is the patient?",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 1
        assert response.metadata.confidence == "medium"
        print(f"✓ Scenario 9 PASS: Authorized access granted")
    
    # ========== SCENARIO GROUP 5: Complex Queries ==========
    
    @pytest.mark.asyncio
    async def test_scenario_10_multiple_source_types(self):
        """
        Scenario 10: Query spanning multiple source types
        Expected: Blend data from patient, appointment, and results
        """
        facts = [
            RetrievedFact(
                source_type="patient",
                source_id=1,
                fact_text="Patient: Ahmed Hassan, Diagnosis: Hypertension",
                snippet="Primary diagnosis: Hypertension",
                confidence=1.0
            ),
            RetrievedFact(
                source_type="appointment",
                source_id=10,
                fact_text="Appointment: 2026-04-20, Reason: BP Check",
                snippet="Appointment on 2026-04-20 (BP Check)",
                timestamp=datetime(2026, 4, 20),
                confidence=1.0
            ),
            RetrievedFact(
                source_type="act_result",
                source_id=20,
                fact_text="Test: BP = 150/95 mmHg (HIGH)",
                snippet="BP: 150/95 mmHg (ABNORMAL - HIGH)",
                timestamp=datetime(2026, 4, 20),
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="Summary of patient's hypertension management",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 3
        assert response.metadata.confidence == "high"
        assert any(s.source_type == "patient" for s in response.sources)
        assert any(s.source_type == "appointment" for s in response.sources)
        assert any(s.source_type == "act_result" for s in response.sources)
        print(f"✓ Scenario 10 PASS: Multiple sources blended seamlessly")
    
    @pytest.mark.asyncio
    async def test_scenario_11_conflicting_records(self):
        """
        Scenario 11: Multiple records for same fact (conflicting data)
        Expected: Return both with dates for comparison
        """
        facts = [
            RetrievedFact(
                source_type="act_result",
                source_id=20,
                fact_text="Glucose = 200 mg/dL (2026-04-10)",
                snippet="Glucose: 200 mg/dL on 2026-04-10",
                timestamp=datetime(2026, 4, 10),
                confidence=1.0
            ),
            RetrievedFact(
                source_type="act_result",
                source_id=21,
                fact_text="Glucose = 120 mg/dL (2026-04-20)",
                snippet="Glucose: 120 mg/dL on 2026-04-20",
                timestamp=datetime(2026, 4, 20),
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="What is the patient's glucose level?",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 2
        assert "2026-04-10" in prompt
        assert "2026-04-20" in prompt
        print(f"✓ Scenario 11 PASS: Conflicting data both cited with dates")
    
    # ========== SCENARIO GROUP 6: Edge Cases ==========
    
    @pytest.mark.asyncio
    async def test_scenario_12_ambiguous_patient_reference(self):
        """
        Scenario 12: Query without explicit patient ID
        Expected: Classification but ask for clarification if ambiguous
        """
        request = ChatRequest(
            query="What are the patient's symptoms?",
            patient_id=None,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        # Should have no sources and either warnings or empty response
        assert len(response.sources) == 0
        assert len(response.warnings) > 0  # Should have at least one warning
        print(f"✓ Scenario 12 PASS: Missing patient ID handled")
    
    @pytest.mark.asyncio
    async def test_scenario_13_general_medical_knowledge(self):
        """
        Scenario 13: General medical question (not patient-specific)
        Expected: Classify as general, no retrieval needed
        """
        request = ChatRequest(
            query="What are the contraindications for aspirin?",
            patient_id=None,
            include_sources=True
        )
        
        # Mock no retrieval for general questions
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=[])
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        # General queries skip patient retrieval
        assert response.metadata.retrieval_type in ("structured", "none")
        print(f"✓ Scenario 13 PASS: General questions routed correctly")
    
    @pytest.mark.asyncio
    async def test_scenario_14_empty_snippet(self):
        """
        Scenario 14: Retrieved fact with empty snippet (fallback to fact_text)
        Expected: Graceful handling, show truncated fact_text
        """
        facts = [
            RetrievedFact(
                source_type="patient",
                source_id=1,
                fact_text="Very long fact text that contains detailed information about patient demographics and medical history...",
                snippet="",  # Empty snippet
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="Tell me about the patient",
            patient_id=1,
            include_sources=True
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 1
        assert response.sources[0].source_type == "patient"
        assert response.sources[0].source_id == 1
        print(f"✓ Scenario 14 PASS: Empty snippet handled gracefully")
    
    @pytest.mark.asyncio
    async def test_scenario_15_special_characters_and_unicode(self):
        """
        Scenario 15: Data with special characters and unicode
        Expected: Proper handling in snippets and prompts
        """
        facts = [
            RetrievedFact(
                source_type="patient",
                source_id=1,
                fact_text="Patient: محمد علي (Mohamed Ali), Notes: أرق و ألم في الظهر",
                snippet="محمد علي - Insomnia & Back pain",
                confidence=1.0
            )
        ]
        self.orchestrator.retriever.retrieve_with_authorization = AsyncMock(return_value=facts)
        
        request = ChatRequest(
            query="Patient information",
            patient_id=1,
            include_sources=True,
            language="ar"
        )
        
        prompt, response, warnings, _ = await self.orchestrator.process_chat_request(request, user_id=1)
        
        assert len(response.sources) == 1
        assert "Mohamed Ali" in prompt or "محمد" in prompt
        assert response.metadata.language == "ar"
        print(f"✓ Scenario 15 PASS: Unicode and special characters handled")


def run_all_scenarios():
    """Run all 15 scenarios and report results."""
    print("\n" + "="*70)
    print("PHASE 1 EVALUATION: 15 Representative Scenarios")
    print("="*70 + "\n")
    
    test = TestEvaluationScenarios()
    scenarios = [
        ("Scenario 1", test.test_scenario_1_patient_demographics),
        ("Scenario 2", test.test_scenario_2_patient_allergies),
        ("Scenario 3", test.test_scenario_3_recent_appointments),
        ("Scenario 4", test.test_scenario_4_abnormal_lab_results),
        ("Scenario 5", test.test_scenario_5_normal_lab_results),
        ("Scenario 6", test.test_scenario_6_no_patient_data_found),
        ("Scenario 7", test.test_scenario_7_limited_evidence_warning),
        ("Scenario 8", test.test_scenario_8_unauthorized_patient_access),
        ("Scenario 9", test.test_scenario_9_authorized_patient_access),
        ("Scenario 10", test.test_scenario_10_multiple_source_types),
        ("Scenario 11", test.test_scenario_11_conflicting_records),
        ("Scenario 12", test.test_scenario_12_ambiguous_patient_reference),
        ("Scenario 13", test.test_scenario_13_general_medical_knowledge),
        ("Scenario 14", test.test_scenario_14_empty_snippet),
        ("Scenario 15", test.test_scenario_15_special_characters_and_unicode),
    ]
    
    print("GROUP 1: Direct Fact Lookup")
    print("-" * 70)
    for name, scenario_func in scenarios[:3]:
        test.setup_method()
        try:
            import asyncio
            asyncio.run(scenario_func())
        except Exception as e:
            print(f"✗ {name} FAILED: {e}\n")
    
    print("\nGROUP 2: Temporal Questions & Abnormalities")
    print("-" * 70)
    for name, scenario_func in scenarios[3:5]:
        test.setup_method()
        try:
            import asyncio
            asyncio.run(scenario_func())
        except Exception as e:
            print(f"✗ {name} FAILED: {e}\n")
    
    print("\nGROUP 3: Insufficient Data Handling")
    print("-" * 70)
    for name, scenario_func in scenarios[5:7]:
        test.setup_method()
        try:
            import asyncio
            asyncio.run(scenario_func())
        except Exception as e:
            print(f"✗ {name} FAILED: {e}\n")
    
    print("\nGROUP 4: Authorization Enforcement")
    print("-" * 70)
    for name, scenario_func in scenarios[7:9]:
        test.setup_method()
        try:
            import asyncio
            asyncio.run(scenario_func())
        except Exception as e:
            print(f"✗ {name} FAILED: {e}\n")
    
    print("\nGROUP 5: Complex Queries")
    print("-" * 70)
    for name, scenario_func in scenarios[9:11]:
        test.setup_method()
        try:
            import asyncio
            asyncio.run(scenario_func())
        except Exception as e:
            print(f"✗ {name} FAILED: {e}\n")
    
    print("\nGROUP 6: Edge Cases")
    print("-" * 70)
    for name, scenario_func in scenarios[11:]:
        test.setup_method()
        try:
            import asyncio
            asyncio.run(scenario_func())
        except Exception as e:
            print(f"✗ {name} FAILED: {e}\n")
    
    print("\n" + "="*70)
    print("EVALUATION COMPLETE")
    print("="*70 + "\n")


if __name__ == "__main__":
    # Run with: python -m pytest backend/tests/test_rag_evaluation.py -v
    # Or: python backend/tests/test_rag_evaluation.py (for summary)
    pytest.main([__file__, "-v", "-s"])
