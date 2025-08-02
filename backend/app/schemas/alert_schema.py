# File: app/schemas/alert_schema.py
from pydantic import BaseModel
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
from .goal_schema import GoalOut 

class AlertBase(BaseModel):
    goal_id: Optional[int] = None
    threshold_percentage: Optional[Decimal] = None
    triggered_at: Optional[datetime] = None
    is_acknowledged: Optional[bool] = False
    
    # New fields to support different alert types
    type: str
    context: Optional[Dict[str, Any]] = None

class AlertCreate(AlertBase):
    pass

class AlertOut(AlertBase):
    id: int
    user_id: int
    # A goal might not exist for non-budget alerts, so it's optional
    goal: Optional[GoalOut] = None

    class Config:
        from_attributes = True