# File: app/crud/alert_crud.py
from sqlalchemy.orm import Session, joinedload
from app.models.alert import Alert, Goal
from app.schemas.alert_schema import AlertCreate
from fastapi import HTTPException
from datetime import datetime

def create_alert(db: Session, alert_in: dict, user_id: int):
    # This function is now specifically for BUDGET alerts
    goal = db.query(Goal).filter(Goal.id == alert_in["goal_id"], Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found for the current user.")
    
    # Prevent creating duplicate unacknowledged budget alerts
    existing_alert = db.query(Alert).filter(
        Alert.user_id == user_id,
        Alert.goal_id == alert_in["goal_id"],
        Alert.threshold_percentage == alert_in["threshold_percentage"],
        Alert.is_acknowledged == False
    ).first()
    if existing_alert:
        return None

    alert = Alert(**alert_in, user_id=user_id, triggered_at=datetime.utcnow(), type='budget')
    db.add(alert)
    return alert

def create_new_category_alert(db: Session, user_id: int, category_name: str):
    """Creates an alert for a newly discovered category name."""
    # Prevent creating duplicate unacknowledged new_category alerts
    existing_alert = db.query(Alert).filter(
        Alert.user_id == user_id,
        Alert.type == 'new_category',
        Alert.context['category_name'].as_string() == category_name,
        Alert.is_acknowledged == False
    ).first()
    if existing_alert:
        return None

    alert = Alert(user_id=user_id, type='new_category', context={"category_name": category_name}, triggered_at=datetime.utcnow())
    db.add(alert)
    return alert

def get_unread_alerts(db: Session, user_id: int):
    return db.query(Alert).options(joinedload(Alert.goal).joinedload(Goal.category)).filter(
        Alert.user_id == user_id,
        Alert.is_acknowledged == False
    ).order_by(Alert.triggered_at.desc()).all()

def acknowledge_alert(db: Session, alert_id: int, user_id: int):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user_id).first()
    if alert:
        alert.is_acknowledged = True
        db.commit()
        db.refresh(alert)
    return alert