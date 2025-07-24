# File: app/api/budget_plan_router.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.budget_plan_service import get_budget_plan, update_budget_plan, delete_budget_plan
from app.schemas.budget_plan_schema import BudgetPlanUpdate
from app.core import deps #! NEW: Import dependencies
from app.models.user import User #! NEW: Import User model for type hint

router = APIRouter()

#! CHANGE: Add dependency to all routes
@router.get("/plan")
def get_user_budget_plan(
    month: str = Query(..., description="Month in YYYY-MM format"), 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return get_budget_plan(db, month=month, user_id=current_user.id)

@router.post("/plan")
def save_user_budget_plan(
    payload: BudgetPlanUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return update_budget_plan(db, plan_data=payload, user_id=current_user.id)

@router.delete("/plan")
def delete_user_plan(
    month: str = Query(..., description="Month in YYYY-MM format"), 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    deleted_count = delete_budget_plan(db, month=month, user_id=current_user.id)
    if deleted_count == 0:
        return {"message": "No active budget plan found for the specified month."}
    return {"message": f"Successfully deleted budget plan for {month}."}