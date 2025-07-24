# File: app/crud/alert_crud.py
from sqlalchemy.orm import Session, joinedload
from app.models.alert import Alert
from app.models.goal import Goal
from app.schemas.alert_schema import AlertCreate
from fastapi import HTTPException
from datetime import datetime

def create_alert(db: Session, alert_in: dict, user_id: int):
    goal = db.query(Goal).filter(
        Goal.id == alert_in["goal_id"],
        Goal.user_id == user_id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found for the current user.")

    alert = Alert(**alert_in, user_id=user_id, triggered_at=datetime.utcnow())
    db.add(alert)
    # The commit is handled by the calling transaction service
    return alert

# ✅ --- THIS IS NEW ---
def get_unread_alerts(db: Session, user_id: int):
    """Fetches all unacknowledged alerts for a user, ordered by most recent."""
    return db.query(Alert).options(joinedload(Alert.goal).joinedload(Goal.category)).filter(
        Alert.user_id == user_id,
        Alert.is_acknowledged == False
    ).order_by(Alert.triggered_at.desc()).all()

# ✅ --- THIS IS NEW ---
def acknowledge_alert(db: Session, alert_id: int, user_id: int):
    """Marks a specific alert as acknowledged for the user."""
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user_id).first()
    if alert:
        alert.is_acknowledged = True
        db.commit()
        db.refresh(alert)
    return alert

# --- Existing functions (for completeness, no changes needed) ---
def get_all_alerts(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Alert).filter(Alert.user_id == user_id).offset(skip).limit(limit).all()

def get_alert_by_id(db: Session, alert_id: int, user_id: int):
    return db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user_id).first()

def delete_alert(db: Session, alert_id: int, user_id: int):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user_id).first()
    if alert:
        db.delete(alert)
        db.commit()
    return alert