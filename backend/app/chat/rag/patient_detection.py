"""
Strict patient auto-detection for RAG (IPP exact match, optional full-name unique match).
"""

import re
import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config_rag import rag_config
from app.models.patient import Patient

logger = logging.getLogger(__name__)

IPP_PATTERN = re.compile(
    r"\b(?:ipp|score\s*ipp)\s*[:=]?\s*([A-Z]{2}\d{6,8}|\d{1,8})\b",
    re.IGNORECASE,
)

NAME_STOPWORDS = {
    "what", "can", "you", "tell", "me", "about", "the", "patient", "patiente",
    "who", "is", "of", "a", "an", "in", "on", "for", "with", "happened", "to",
    "hey", "bonjour", "salut", "svp", "please", "que", "peux", "tu", "dire",
    "moi", "sur", "le", "la", "du", "de", "des", "un", "une", "et", "ou",
}


def detect_patient_from_query(db: Session, query: str) -> Tuple[Optional[int], List[str]]:
    """
    Resolve patient id from query text.

    Returns:
        (patient_id or None, warnings)
    """
    warnings: List[str] = []

    if not rag_config.AUTO_DETECT_ENABLED:
        return None, warnings

    ipp_match = IPP_PATTERN.search(query)
    if ipp_match:
        ipp_value = ipp_match.group(1).strip()
        patient = db.query(Patient).filter(Patient.ipp == ipp_value).first()
        if patient:
            return patient.id, warnings

        if rag_config.AUTO_DETECT_REQUIRE_EXACT_MATCH:
            warnings.append(f"Patient with IPP '{ipp_value}' not found.")
            return None, warnings

        # Non-strict: normalized unique match only
        normalized = _normalize_ipp(ipp_value)
        candidates = [
            p for p in db.query(Patient).filter(Patient.ipp.isnot(None)).all()
            if _normalize_ipp(p.ipp) == normalized
        ]
        if len(candidates) == 1:
            return candidates[0].id, warnings
        if len(candidates) > 1:
            warnings.append("Multiple patients matched the provided IPP. Please clarify.")
        else:
            warnings.append(f"Patient with IPP '{ipp_value}' not found.")
        return None, warnings

    # Full name: two tokens, exact case-insensitive match, unique only
    name_pair = _extract_name_tokens(query)
    if len(name_pair) >= 2:
        first_t, last_t = name_pair[0], name_pair[1]
        matches = (
            db.query(Patient)
            .filter(
                Patient.first_name.ilike(first_t),
                Patient.last_name.ilike(last_t),
            )
            .all()
        )
        if len(matches) == 1:
            return matches[0].id, warnings
        if len(matches) > 1:
            warnings.append("Multiple patients matched the provided name. Please specify IPP.")
        return None, warnings

    return None, warnings


def _normalize_ipp(value: str) -> str:
    if not value:
        return ""
    cleaned = re.sub(r"[^A-Za-z0-9]", "", value).lower()
    if cleaned.startswith("ipp"):
        cleaned = cleaned[3:]
    if cleaned.isdigit():
        cleaned = cleaned.lstrip("0") or "0"
    return cleaned


def _extract_name_tokens(query: str) -> List[str]:
    raw = [t for t in re.split(r"\s+", query.strip()) if t.isalpha()]
    lower = [t.lower() for t in raw]
    tokens = [t for t in lower if t not in NAME_STOPWORDS]

    if "patient" in lower:
        idx = lower.index("patient")
        tokens = lower[idx + 1 : idx + 4]
    elif "patiente" in lower:
        idx = lower.index("patiente")
        tokens = lower[idx + 1 : idx + 4]

    tokens = [t for t in tokens if t not in NAME_STOPWORDS]
    return tokens[:3]
