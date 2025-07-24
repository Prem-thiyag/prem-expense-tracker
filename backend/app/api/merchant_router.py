# File: app/api/merchant_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.merchant_schema import MerchantCreate, MerchantOut, MerchantUpdate
from app.crud import merchant_crud
from app.core import deps #! NEW: Import dependencies
from app.models.user import User #! NEW: Import User model for type hint

router = APIRouter()

#! CHANGE: Protect all routes and pass user_id down
@router.post("/", response_model=MerchantOut)
def create_merchant_for_user(
    merchant_in: MerchantCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    try:
        return merchant_crud.create_merchant(db, merchant_in=merchant_in, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.get("/", response_model=List[MerchantOut])
def get_all_user_merchants(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return merchant_crud.get_all_merchants(db, user_id=current_user.id)

@router.put("/{merchant_id}", response_model=MerchantOut)
def update_user_merchant(
    merchant_id: int, 
    merchant_in: MerchantUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    try:
        merchant = merchant_crud.update_merchant(db, merchant_id=merchant_id, merchant_in=merchant_in, user_id=current_user.id)
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found or you do not have permission to edit it")
        return merchant
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.delete("/{merchant_id}", response_model=MerchantOut)
def delete_user_merchant(
    merchant_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    merchant = merchant_crud.delete_merchant(db, merchant_id=merchant_id, user_id=current_user.id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found or you do not have permission to delete it")
    return merchant