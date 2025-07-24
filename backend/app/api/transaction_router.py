# File: app/api/transaction_router.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.db.session import get_db
from app.services.transaction_service import get_filtered_transactions
from app.schemas.transaction_log_schema import TransactionLogOut
from app.schemas.transaction_schema import TransactionCreate, TransactionOut, TransactionUpdate
from app.crud import transaction_crud
from app.core import deps
from app.models.user import User

# No redirect_slashes needed
router = APIRouter()

#! CHANGE: The path is now "" instead of "/".
@router.get("", response_model=TransactionLogOut)
def get_transactions_with_filters(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    account_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    type: Optional[str] = Query(None),
    search_term: Optional[str] = Query(None)
):
    filters = {
        "page": page, "limit": limit, "account_id": account_id,
        "category_id": category_id, "start_date": start_date,
        "end_date": end_date, "type": type, "search_term": search_term
    }
    active_filters = {k: v for k, v in filters.items() if v is not None and v != ''}
    return get_filtered_transactions(db, filters=active_filters, user_id=current_user.id)

#! CHANGE: The path is now "" instead of "/".
@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_manual_transaction(
    txn_in: TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return transaction_crud.create_transaction(db, txn_in=txn_in, user_id=current_user.id)

# Routes with path parameters are fine and do not need changes.
@router.get("/{txn_id}", response_model=TransactionOut)
def get_transaction_by_id_route(
    txn_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    txn = transaction_crud.get_transaction_by_id(db, txn_id=txn_id, user_id=current_user.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@router.put("/{txn_id}", response_model=TransactionOut)
def update_transaction_route(
    txn_id: int, 
    txn_in: TransactionUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    txn = transaction_crud.update_transaction(db, txn_id=txn_id, txn_in=txn_in, user_id=current_user.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found or you do not have permission to edit it")
    return txn

@router.delete("/{txn_id}")
def delete_transaction_route(
    txn_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    txn = transaction_crud.delete_transaction(db, txn_id=txn_id, user_id=current_user.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found or you do not have permission to delete it")
    return {"message": "Transaction deleted successfully"}