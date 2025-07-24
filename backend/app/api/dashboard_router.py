# File: app/api/dashboard_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.dashboard_service import get_dashboard_data
from app.core import deps
from app.models.user import User

# Remove redirect_slashes=False, it's not needed with this fix.
router = APIRouter()

#! CHANGE: The path is now "" (an empty string) instead of "/".
@router.get("")
def dashboard(
    month: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return get_dashboard_data(db, month=month, user_id=current_user.id)