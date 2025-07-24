# File: app/services/auth_service.py
# This file can be removed or simplified as its logic is now in `app/core/deps.py`.
# For now, we will leave it empty to avoid import errors in other files that might still reference it.
# You can delete this file and update the imports later.
from app.models.user import User

def get_current_user(db, token) -> User:
    # This logic is now handled by deps.get_current_active_user
    # This function is now deprecated.
    raise NotImplementedError("This function is deprecated. Use deps.get_current_active_user instead.")