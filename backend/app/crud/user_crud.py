# File: app/crud/user_crud.py
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.schemas.user_schema import UserCreate
from app.core.security import get_password_hash

def get_user_by_identifier(db: Session, identifier: str):
    """Finds a user by their username OR their email."""
    return db.query(User).filter(
        or_(User.username == identifier, User.email == identifier)
    ).first()

#! THIS IS THE FIX: Add the missing function that our authenticator needs.
def get_user_by_email(db: Session, email: str) -> User | None:
    """Finds a user specifically by their email."""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    # We have removed the data seeding as you requested.
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return user