# File: app/api/account_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.crud import account_crud
from app.schemas.account_schema import AccountCreate, AccountOut, AccountUpdate
from app.core import deps
from app.models.user import User

# No redirect_slashes needed
router = APIRouter()

#! CHANGE: The path is now "" instead of "/".
@router.get("", response_model=List[AccountOut])
def read_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return account_crud.get_all_accounts(db, user_id=current_user.id)

#! CHANGE: The path is now "" instead of "/".
@router.post("", response_model=AccountOut)
def create_account(
    account_in: AccountCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return account_crud.create_account(db, account_in=account_in, user_id=current_user.id)

# Routes with path parameters are fine and do not need changes.
@router.put("/{account_id}", response_model=AccountOut)
def update_account(
    account_id: int, 
    account_in: AccountUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    updated_account = account_crud.update_account(db, account_id=account_id, account_in=account_in, user_id=current_user.id)
    if not updated_account:
        raise HTTPException(status_code=404, detail="Account not found or you do not have permission to edit it")
    return updated_account

@router.delete("/{account_id}", response_model=AccountOut)
def delete_account(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    deleted_account = account_crud.delete_account(db, account_id=account_id, user_id=current_user.id)
    if not deleted_account:
        raise HTTPException(status_code=404, detail="Account not found or you do not have permission to delete it")
    return deleted_account