# File: app/api/goal_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.crud import goal_crud
from app.schemas.goal_schema import GoalCreate, GoalOut, GoalUpdate
from app.core import deps #! NEW: Import dependencies
from app.models.user import User #! NEW: Import User model for type hint

router = APIRouter()

#! CHANGE: Protect all routes and pass user_id down
@router.post("/", response_model=GoalOut)
def create(
    goal_in: GoalCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    goal = goal_crud.create_goal(db, goal_in=goal_in, user_id=current_user.id)
    db.commit()
    return goal

@router.get("/", response_model=List[GoalOut])
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    month: Optional[str] = Query(None, description="Filter by month in YYYY-MM format"),
    skip: int = 0,
    limit: int = 100
):
    if month:
        return goal_crud.get_goals_by_month(db, month=month, user_id=current_user.id)
    return goal_crud.get_all_goals(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{goal_id}", response_model=GoalOut)
def read(
    goal_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # The get_goal_by_id function already raises a 404 if not found for the user
    return goal_crud.get_goal_by_id(db, goal_id=goal_id, user_id=current_user.id)

@router.put("/{goal_id}", response_model=GoalOut)
def update(
    goal_id: int, 
    goal_in: GoalUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    updated_goal = goal_crud.update_goal(db, goal_id=goal_id, goal_in=goal_in, user_id=current_user.id)
    if not updated_goal:
        raise HTTPException(status_code=404, detail="Goal not found or you do not have permission to edit it")
    db.commit()
    return updated_goal

@router.delete("/{goal_id}", response_model=GoalOut)
def delete(
    goal_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # delete_goal will raise an error if not found for the user
    deleted_goal = goal_crud.delete_goal(db, goal_id=goal_id, user_id=current_user.id)
    return deleted_goal