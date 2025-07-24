# File: app/schemas/alert_schema.py
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from .goal_schema import GoalOut # ✅ 1. Import GoalOut

class AlertBase(BaseModel):
    goal_id: int
    threshold_percentage: Decimal
    triggered_at: Optional[datetime] = None
    is_acknowledged: Optional[bool] = False

class AlertCreate(AlertBase):
    pass

class AlertOut(AlertBase):
    id: int
    user_id: int
    # ✅ 2. THIS IS THE FIX
    # Tell Pydantic to include the full nested goal object.
    # It will use the `goal` relationship on the SQLAlchemy Alert model.
    goal: GoalOut

    class Config:
        from_attributes = True