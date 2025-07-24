# File: app/api/analytics_router.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_service import get_analytics_data
from app.core import deps
from app.models.user import User

# No redirect_slashes needed
router = APIRouter()

#! CHANGE: The path is now "" instead of "/".
@router.get("")
def analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    time_period: str = Query("6m"), 
    include_capital_transfers: bool = Query(False)
):
    return get_analytics_data(
        db, 
        time_period=time_period, 
        include_capital_transfers=include_capital_transfers,
        user_id=current_user.id
    )