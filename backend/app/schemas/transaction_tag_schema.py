# File: app/schemas/transaction_tag_schema.py
from pydantic import BaseModel
from .tag_schema import TagOut # ✅ 1. Import the TagOut schema

class TransactionTagBase(BaseModel):
    transaction_id: int
    tag_id: int

class TransactionTagCreate(TransactionTagBase):
    pass

# ✅ --- THIS IS THE FIX ---
# We are redesigning this schema to reflect what the frontend needs.
# Instead of just IDs, it will now contain the full Tag object.
class TransactionTagOut(BaseModel):
    # This tells Pydantic to look for a 'tag' relationship on the
    # TransactionTag model and serialize it using the TagOut schema.
    tag: TagOut 

    class Config:
        from_attributes = True