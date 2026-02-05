from app.models.llm import llm

def get_chat_response(message: str, patient_id: int = None) -> str:
    """Generate a response using the LLM."""
    context = ""
    if patient_id:
        context = f"[Context: Patient ID {patient_id}] "
    
    prompt = context + message
    response = llm.generate(prompt)
    return response
