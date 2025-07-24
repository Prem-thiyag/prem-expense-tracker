# File: app/schemas/goal_schema.py
from pydantic import BaseModel
from typing import Optional
from .category_schema import CategoryOut # ✅ 1. Import CategoryOut

class GoalBase(BaseModel):
    category_id: int
    month: str  # YYYY-MM format
    limit_amount: float

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    limit_amount: float

class GoalOut(GoalBase):
    id: int
    user_id: int
    # ✅ 2. THIS IS THE FIX
    # Tell Pydantic to include the nested category object in the response.
    # It will use the `category` relationship on the SQLAlchemy Goal model.
    category: CategoryOut

    class Config:
        from_attributes = True