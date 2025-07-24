# File: app/crud/account_crud.py
from sqlalchemy.orm import Session
from app.models.account import Account
from app.schemas.account_schema import AccountCreate, AccountUpdate

#! CHANGE: All functions now require a user_id
def get_all_accounts(db: Session, user_id: int):
    return db.query(Account).filter(Account.user_id == user_id).all()

def create_account(db: Session, account_in: AccountCreate, user_id: int):
    # Automatically assign the account to the current user
    account = Account(**account_in.model_dump(), user_id=user_id)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

def update_account(db: Session, account_id: int, account_in: AccountUpdate, user_id: int):
    # Ensure the user can only update their own account
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()
    if not account:
        return None
    account_data = account_in.model_dump(exclude_unset=True)
    for key, value in account_data.items():
        setattr(account, key, value)
    db.commit()
    db.refresh(account)
    return account

def delete_account(db: Session, account_id: int, user_id: int):
    # Ensure the user can only delete their own account
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()
    if account:
        db.delete(account)
        db.commit()
    return account