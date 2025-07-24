from sqlalchemy.orm import Session
from fastapi import Depends
from app.db.session import SessionLocal

from typing import Generator

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
