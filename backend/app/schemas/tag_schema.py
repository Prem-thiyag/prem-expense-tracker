# File: app/schemas/tag_schema.py
from pydantic import BaseModel

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagUpdate(TagBase):
    pass

class TagOut(TagBase):
    id: int
    user_id: int #! CHANGE: Add user_id to the output schema

    class Config:
        from_attributes = True