# File: app/api/transaction_tag_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.transaction_tag_schema import TransactionTagCreate, TransactionTagOut
from app.crud import transaction_tag_crud
from app.core import deps #! NEW: Import dependencies
from app.models.user import User #! NEW: Import User model for type hint

router = APIRouter()

#! CHANGE: Protect all routes and pass user_id down
@router.post("/", response_model=TransactionTagOut, status_code=status.HTTP_201_CREATED)
def create_transaction_tag(
    txn_tag_in: TransactionTagCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return transaction_tag_crud.add_tag_to_transaction(db, txn_tag_in=txn_tag_in, user_id=current_user.id)

@router.delete("/")
def delete_transaction_tag(
    transaction_id: int, 
    tag_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    txn_tag = transaction_tag_crud.remove_tag_from_transaction(db, transaction_id=transaction_id, tag_id=tag_id, user_id=current_user.id)
    if not txn_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction-tag association not found or you do not have permission to delete it.")
    return {"detail": "Tag removed from transaction successfully."}

@router.get("/{transaction_id}", response_model=List[TransactionTagOut])
def get_transaction_tags(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return transaction_tag_crud.get_tags_for_transaction(db, transaction_id=transaction_id, user_id=current_user.id)