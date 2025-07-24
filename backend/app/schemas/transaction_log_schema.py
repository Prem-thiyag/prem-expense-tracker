# File: app/schemas/transaction_log_schema.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .tag_schema import TagOut 

class TransactionItem(BaseModel):
    id: int
    txn_date: datetime
    description: str
    amount: float
    type: str
    source: str
    account_id: int
    category_id: Optional[int] = None
    merchant_id: Optional[int] = None
    upi_ref: Optional[str] = None
    unique_key: Optional[str] = None
    
    # ✅ THIS IS THE FIX
    # Just like TransactionOut, this schema now expects a clean list of TagOut objects.
    # This perfectly matches the frontend's type definition and resolves the validation error.
    tags: List[TagOut] = []

    class Config:
        from_attributes = True

class TransactionLogOut(BaseModel):
    total_count: int
    page: int
    limit: int
    transactions: List[TransactionItem]