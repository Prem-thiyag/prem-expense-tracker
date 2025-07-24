from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.dependency import get_db

router = APIRouter()

@router.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    # Just testing if session is working
    return {"db_status": "Connection successful!"}
