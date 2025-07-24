# File: app/crud/goal_crud.py
from sqlalchemy.orm import Session
from app.models.goal import Goal
from app.models.category import Category
from app.schemas.goal_schema import GoalCreate, GoalUpdate
from fastapi import HTTPException

#! CHANGE: All functions now require a user_id for scoping
def upsert_budget_for_category(db: Session, category_id: int, month: str, limit_amount: float, user_id: int):
    """
    Finds a goal for a given category and month FOR A SPECIFIC USER.
    - If it exists, it updates the limit_amount.
    - If the new limit_amount is 0, it deletes the goal.
    - If it does not exist and the limit_amount is > 0, it creates a new goal.
    """
    # Validate that the category belongs to the user
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found for the current user.")

    # Scope the goal search to the current user
    existing_goal = db.query(Goal).filter(
        Goal.category_id == category_id,
        Goal.month == month,
        Goal.user_id == user_id
    ).first()

    if existing_goal:
        if limit_amount > 0:
            existing_goal.limit_amount = limit_amount
        else:
            db.delete(existing_goal)
    elif limit_amount > 0:
        new_goal = Goal(
            category_id=category_id, 
            month=month, 
            limit_amount=limit_amount,
            user_id=user_id # Assign to the current user
        )
        db.add(new_goal)
    # The commit is handled by the calling service/router.

def create_goal(db: Session, goal_in: GoalCreate, user_id: int):
    # Pass user_id to the core upsert logic
    upsert_budget_for_category(db, goal_in.category_id, goal_in.month, goal_in.limit_amount, user_id)
    # Since upsert doesn't return the object, we can refetch it or just return a success message.
    # For consistency with the service, let's assume the calling function will handle the response.
    # The router might refetch or return the input.
    # Let's return the new/updated goal for clarity in the direct API route.
    return db.query(Goal).filter(
        Goal.category_id == goal_in.category_id,
        Goal.month == goal_in.month,
        Goal.user_id == user_id
    ).first()


def get_goal_by_id(db: Session, goal_id: int, user_id: int):
    # Filter by goal ID and user ID
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    return goal

def get_goals_by_month(db: Session, month: str, user_id: int):
    # Filter by month and user ID
    return db.query(Goal).filter(Goal.month == month, Goal.user_id == user_id).all()

def get_all_goals(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    # Filter by user ID
    return db.query(Goal).filter(Goal.user_id == user_id).offset(skip).limit(limit).all()

def update_goal(db: Session, goal_id: int, goal_in: GoalUpdate, user_id: int):
    # First, ensure the goal exists and belongs to the user
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        return None # Return None to indicate not found
    
    # Use the consistent upsert logic to perform the update
    upsert_budget_for_category(db, goal.category_id, goal.month, goal_in.limit_amount, user_id)
    db.refresh(goal) # Refresh the instance to get latest data (like updated_at)
    return goal

def delete_goal(db: Session, goal_id: int, user_id: int):
    # Ensure the goal exists and belongs to the user before deleting
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    db.delete(goal)
    db.commit()
    return goal # Return the deleted object for confirmation

def delete_goals_by_month(db: Session, month: str, user_id: int):
    """
    Deletes all budget goals for a specific month for a specific user.
    """
    num_deleted = db.query(Goal).filter(
        Goal.month == month,
        Goal.user_id == user_id
    ).delete(synchronize_session=False)
    db.commit()
    return num_deleted