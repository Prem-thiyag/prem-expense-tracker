# File: app/schemas/account_schema.py
from pydantic import BaseModel
from typing import Optional

class AccountBase(BaseModel):
    name: str
    type: str
    provider: str
    account_number: Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    provider: Optional[str] = None
    account_number: Optional[str] = None

class AccountOut(AccountBase):
    id: int
    user_id: int #! CHANGE: Add user_id to output schema

    class Config:
        from_attributes = True