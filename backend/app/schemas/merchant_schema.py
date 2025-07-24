# File: app/schemas/merchant_schema.py
from pydantic import BaseModel
from typing import Optional

class MerchantBase(BaseModel):
    name: str
    category_id: Optional[int] = None

class MerchantCreate(MerchantBase):
    pass

class MerchantUpdate(MerchantBase):
    pass

class MerchantOut(MerchantBase):
    id: int
    user_id: int #! CHANGE: Add user_id to the output schema

    class Config:
        from_attributes = True