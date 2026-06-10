"""
Rank and cap retrieved facts for prompt budget.
"""

from datetime import datetime
from typing import List

from app.chat.rag.retrievers.structured_retriever import RetrievedFact
from app.core.config_rag import rag_config

SOURCE_PRIORITY = {
    "patient": 5,
    "patient_note": 5,
    "act_result": 4,
    "medical_act": 4,
    "act_note": 4,
    "appointment": 3,
    "pdf_extract": 2,
    "chat_summary": 1,
}


def rank_and_cap_facts(facts: List[RetrievedFact], max_facts: int = None) -> List[RetrievedFact]:
    """Deduplicate, score by type + recency, return top N."""
    if not facts:
        return []

    cap = max_facts or rag_config.MAX_TOTAL_FACTS
    seen = set()
    unique: List[RetrievedFact] = []

    for fact in facts:
        key = (fact.source_type, fact.source_id, fact.snippet[:80])
        if key in seen:
            continue
        seen.add(key)
        unique.append(fact)

    def sort_key(f: RetrievedFact):
        ts = f.timestamp or datetime.min
        if hasattr(ts, "tzinfo") and ts.tzinfo:
            ts = ts.replace(tzinfo=None)
        priority = SOURCE_PRIORITY.get(f.source_type, 1)
        score = f.confidence or 0.5
        return (priority, score, ts)

    unique.sort(key=sort_key, reverse=True)
    return unique[:cap]
