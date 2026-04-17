# File: app/schemas/auth_schema.py
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class LoginRequest(BaseModel):
    identifier: str
    password: str
    remember_me: bool = False

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str