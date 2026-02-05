from app.services.patient_service import anonymize_patient_data
from app.utils.preprocessing import clean_text, anonymize_text

def test_anonymize_patient():
    data = {"name": "John Doe", "age": 45}
    result = anonymize_patient_data(data)
    assert result["name"] == "ANONYMIZED"
    assert result["age"] == 45

def test_clean_text():
    text = "  Hello   world  "
    result = clean_text(text)
    assert result == "Hello world"

def test_anonymize_text():
    text = "Contact: test@email.com or 1234567890"
    result = anonymize_text(text)
    assert "[EMAIL]" in result
    assert "[PHONE]" in result
