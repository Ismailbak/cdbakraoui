from typing import List, Optional

def get_all_patients() -> List[dict]:
    return []

def get_patient_by_id(patient_id: int) -> Optional[dict]:
    return None

def create_patient(data: dict) -> dict:
    return data

def update_patient(patient_id: int, data: dict) -> dict:
    return data

def delete_patient(patient_id: int) -> bool:
    return True

def anonymize_patient_data(data: dict) -> dict:
    """Remove or mask PII from patient data."""
    anonymized = data.copy()
    if "name" in anonymized:
        anonymized["name"] = "ANONYMIZED"
    return anonymized
