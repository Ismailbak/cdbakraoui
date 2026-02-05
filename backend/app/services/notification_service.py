from typing import List, Dict

def get_user_notifications(user_id: int) -> List[Dict]:
    return []

def mark_notification_read(notification_id: int) -> bool:
    return True

def create_notification(user_id: int, title: str, message: str) -> Dict:
    return {"id": 1, "user_id": user_id, "title": title, "message": message, "read": False}
