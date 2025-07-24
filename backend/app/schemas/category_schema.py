# File: app/schemas/category_schema.py
from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    is_income: bool
    icon_name: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    is_income: Optional[bool] = None
    icon_name: Optional[str] = None

class CategoryOut(CategoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True