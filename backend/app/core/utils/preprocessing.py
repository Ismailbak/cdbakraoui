import re
from typing import List

def clean_text(text: str) -> str:
    """Basic text cleaning for medical notes."""
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    return text

def extract_keywords(text: str) -> List[str]:
    """Extract keywords from text."""
    words = text.lower().split()
    return list(set(words))

def anonymize_text(text: str) -> str:
    """Remove potential PII from text."""
    # Remove phone numbers
    text = re.sub(r'\b\d{10}\b', '[PHONE]', text)
    # Remove emails
    text = re.sub(r'\b[\w.-]+@[\w.-]+\.\w+\b', '[EMAIL]', text)
    return text
