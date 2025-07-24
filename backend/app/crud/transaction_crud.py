# File: app/crud/transaction_crud.py
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.tag import Tag
from app.models.account import Account
from app.models.transaction_tag import TransactionTag
from app.schemas.transaction_schema import TransactionCreate, TransactionUpdate
from app.services.alert_service import check_and_create_budget_alerts # ✅ 1. Import the service
from fastapi import HTTPException

def create_transaction(db: Session, txn_in: TransactionCreate, user_id: int):
    account = db.query(Account).filter(Account.id == txn_in.account_id, Account.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found for the current user.")

    txn_dict = txn_in.model_dump(exclude={"tag_ids"})
    txn = Transaction(**txn_dict, user_id=user_id)

    if txn_in.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(txn_in.tag_ids), Tag.user_id == user_id).all()
        if len(tags) != len(txn_in.tag_ids):
            raise HTTPException(status_code=400, detail="One or more tags are invalid or do not belong to the user.")
        for tag in tags:
            txn.tags_association.append(TransactionTag(tag=tag, user_id=user_id))
            
    db.add(txn)
    db.commit()
    db.refresh(txn)

    # ✅ 2. After saving, check for alerts
    check_and_create_budget_alerts(db, user_id, txn)
    db.commit() # Commit any new alerts

    return txn

def update_transaction(db: Session, txn_id: int, txn_in: TransactionUpdate, user_id: int):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()
    if not txn:
        return None

    update_data = txn_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field != "tag_ids":
            setattr(txn, field, value)

    if "tag_ids" in update_data:
        txn.tags_association = []
        db.flush()
        if update_data["tag_ids"]:
            tags = db.query(Tag).filter(Tag.id.in_(update_data["tag_ids"]), Tag.user_id == user_id).all()
            if len(tags) != len(update_data["tag_ids"]):
                raise HTTPException(status_code=400, detail="One or more tags are invalid or do not belong to the user.")
            for tag in tags:
                txn.tags_association.append(TransactionTag(tag=tag, user_id=user_id))

    db.commit()
    db.refresh(txn)

    # ✅ 3. Also check for alerts after an update
    check_and_create_budget_alerts(db, user_id, txn)
    db.commit() # Commit any new alerts

    return txn

# No changes needed for get or delete
def get_transaction_by_id(db: Session, txn_id: int, user_id: int):
    return db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()

def delete_transaction(db: Session, txn_id: int, user_id: int):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()
    if txn:
        db.delete(txn)
        db.commit()
    return txn