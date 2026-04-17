# File: app/api/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserOut
from app.schemas.auth_schema import Token, LoginRequest, ChangePasswordRequest
from app.crud import user_crud
from app.core.security import (
    verify_password, create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, REMEMBER_ME_EXPIRE_DAYS, get_password_hash
)
from app.core import deps

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_identifier(db, identifier=user_in.username)
    if user:
        raise HTTPException(status_code=409, detail="Username already registered")
    user_by_email = db.query(user_crud.User).filter(user_crud.User.email == user_in.email).first()
    if user_by_email:
        raise HTTPException(status_code=409, detail="Email already registered")
    return user_crud.create_user(db, user=user_in)


@router.post("/login/password", response_model=Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """Legacy form-based login kept for Swagger UI compatibility."""
    user = user_crud.get_user_by_identifier(db, identifier=form_data.username)
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)):
    """JSON login endpoint supporting Remember Me (30-day token) vs session (60-min token)."""
    user = user_crud.get_user_by_identifier(db, identifier=payload.identifier)
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if payload.remember_me:
        expires = timedelta(days=REMEMBER_ME_EXPIRE_DAYS)
    else:
        expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(data={"sub": user.email}, expires_delta=expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user)
):
    """Allows a logged-in user to change their password by providing the old one."""
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user_crud.update_password(db, user_id=current_user.id, new_hashed_password=get_password_hash(payload.new_password))
    return {"message": "Password updated successfully"}
