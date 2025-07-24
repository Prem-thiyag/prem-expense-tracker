# File: app/crud/transaction_crud.py
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.tag import Tag
from app.models.account import Account
from app.models.transaction_tag import TransactionTag
from app.schemas.transaction_schema import TransactionCreate, TransactionUpdate
from fastapi import HTTPException

#! CHANGE: All functions now require user_id
def create_transaction(db: Session, txn_in: TransactionCreate, user_id: int):
    # Ensure the account belongs to the user
    account = db.query(Account).filter(Account.id == txn_in.account_id, Account.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found for the current user.")

    txn_dict = txn_in.model_dump(exclude={"tag_ids"})
    txn = Transaction(**txn_dict, user_id=user_id)

    if txn_in.tag_ids:
        # Ensure tags also belong to the user
        tags = db.query(Tag).filter(Tag.id.in_(txn_in.tag_ids), Tag.user_id == user_id).all()
        if len(tags) != len(txn_in.tag_ids):
            raise HTTPException(status_code=400, detail="One or more tags are invalid or do not belong to the user.")
        for tag in tags:
            # ✅ --- THIS IS THE FIX ---
            # When creating the association, you must now also provide the user_id.
            txn.tags.append(TransactionTag(tag=tag, user_id=user_id))
            
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn

def get_transaction_by_id(db: Session, txn_id: int, user_id: int):
    # Filter by both transaction ID and user ID
    return db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()

def delete_transaction(db: Session, txn_id: int, user_id: int):
    # Ensure user can only delete their own transaction
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()
    if txn:
        db.delete(txn)
        db.commit()
    return txn

def update_transaction(db: Session, txn_id: int, txn_in: TransactionUpdate, user_id: int):
    # Ensure user can only update their own transaction
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()
    if not txn:
        return None

    update_data = txn_in.model_dump(exclude_unset=True)
    
    # Update simple fields
    for field, value in update_data.items():
        if field != "tag_ids":
            setattr(txn, field, value)

    if "tag_ids" in update_data:
        # Clear existing tags for this transaction
        db.query(TransactionTag).filter(TransactionTag.transaction_id == txn_id).delete(synchronize_session=False)

        if update_data["tag_ids"]:
            # Ensure new tags belong to the user
            tags = db.query(Tag).filter(Tag.id.in_(update_data["tag_ids"]), Tag.user_id == user_id).all()
            if len(tags) != len(update_data["tag_ids"]):
                raise HTTPException(status_code=400, detail="One or more tags are invalid or do not belong to the user.")
            
            for tag in tags:
                # ✅ --- THIS IS THE FIX ---
                # Also provide the user_id when creating the new association during an update.
                new_association = TransactionTag(transaction_id=txn_id, tag_id=tag.id, user_id=user_id)
                db.add(new_association)

    db.commit()
    db.refresh(txn)
    return txn