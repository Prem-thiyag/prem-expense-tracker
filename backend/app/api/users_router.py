# File: app/api/users_router.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user_schema import UserOut
from app.crud import user_crud
from app.core.security import verify_password
from app.core import deps #! NEW: Import our main dependencies
from app.models.user import User #! NEW: Import the User model

router = APIRouter(redirect_slashes=False)

#! THIS IS THE FIX: This endpoint now uses our standard, working dependency.
@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(deps.get_current_active_user)):
    """
    Get the profile for the currently logged-in user.
    The dependency handles all the validation.
    """
    return current_user

@router.delete("/me")
def delete_current_user(
    password_form: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Deletes the currently logged-in user after verifying their password.
    """
    password = password_form.get("password")
    if not password or not verify_password(password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    user_crud.delete_user(db, user_id=current_user.id)
    return {"message": "User account deleted successfully."}