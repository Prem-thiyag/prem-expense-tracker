# File: app/api/transaction_router.py

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date

from app.db.session import get_db
from app.services.transaction_service import get_filtered_transactions
from app.schemas.transaction_log_schema import TransactionLogOut
from app.schemas.transaction_schema import TransactionCreate, TransactionOut, TransactionUpdate
from app.crud import transaction_crud

# This is our single source of truth for transaction routes
router = APIRouter(tags=["Transactions"])

# ✅ This is our new, powerful GET endpoint for the table
@router.get("/", response_model=TransactionLogOut)
def get_transactions_with_filters(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1), # Let's match the frontend's limit
    account_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search_term: Optional[str] = Query(None),
    
    # ✅ --- THIS IS THE FIX ---
    # Add the 'type' parameter to the function signature so FastAPI will recognize it.
    type: Optional[str] = Query(None, description="Filter by transaction type ('debit' or 'credit')")
):
    filters = {
        "page": page, "limit": limit, "account_id": account_id,
        "category_id": category_id, "start_date": start_date,
        "end_date": end_date, "search_term": search_term,
        "type": type # Now the 'type' will be included
    }
    # Remove None values so we don't send empty filters to the service
    active_filters = {k: v for k, v in filters.items() if v is not None and v != ''}
    return get_filtered_transactions(db, active_filters)

# --- The other standard CRUD endpoints remain useful ---

@router.post("/", response_model=TransactionOut)
def create_manual_transaction(txn_in: TransactionCreate, db: Session = Depends(get_db)):
    return transaction_crud.create_transaction(db, txn_in)

@router.get("/{txn_id}", response_model=TransactionOut)
def get_transaction_by_id(txn_id: int, db: Session = Depends(get_db)):
    txn = transaction_crud.get_transaction_by_id(db, txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@router.put("/{txn_id}", response_model=TransactionOut)
def update_transaction(txn_id: int, txn_in: TransactionUpdate, db: Session = Depends(get_db)):
    txn = transaction_crud.update_transaction(db, txn_id, txn_in)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@router.delete("/{txn_id}")
def delete_transaction(txn_id: int, db: Session = Depends(get_db)):
    txn = transaction_crud.delete_transaction(db, txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}