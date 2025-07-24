# File: app/crud/merchant_crud.py
from sqlalchemy.orm import Session
from app.models.merchant import Merchant
from app.models.category import Category
from app.schemas.merchant_schema import MerchantCreate, MerchantUpdate
from fastapi import HTTPException

#! CHANGE: All functions now require a user_id
def create_merchant(db: Session, merchant_in: MerchantCreate, user_id: int):
    # Check for name uniqueness only within the current user's merchants
    existing = db.query(Merchant).filter(
        Merchant.name == merchant_in.name,
        Merchant.user_id == user_id
    ).first()
    if existing:
        raise ValueError("You already have a merchant with this name.")
    
    # If a category is assigned, ensure it belongs to the current user
    if merchant_in.category_id:
        category = db.query(Category).filter(
            Category.id == merchant_in.category_id,
            Category.user_id == user_id
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found for the current user.")

    # Assign the new merchant to the current user
    merchant = Merchant(**merchant_in.model_dump(), user_id=user_id)
    db.add(merchant)
    db.commit()
    db.refresh(merchant)
    return merchant

def get_all_merchants(db: Session, user_id: int):
    # Fetch merchants only for the current user
    return db.query(Merchant).filter(Merchant.user_id == user_id).all()

def update_merchant(db: Session, merchant_id: int, merchant_in: MerchantUpdate, user_id: int):
    # Ensure the merchant exists and belongs to the current user
    merchant = db.query(Merchant).filter(
        Merchant.id == merchant_id,
        Merchant.user_id == user_id
    ).first()
    if not merchant:
        return None

    # If the name is being changed, check for uniqueness among the user's other merchants
    if merchant_in.name and merchant_in.name != merchant.name:
        existing = db.query(Merchant).filter(
            Merchant.name == merchant_in.name,
            Merchant.user_id == user_id
        ).first()
        if existing:
            raise ValueError("You already have another merchant with this name.")
            
    # If the category is being changed, ensure it belongs to the user
    if merchant_in.category_id and merchant_in.category_id != merchant.category_id:
        category = db.query(Category).filter(
            Category.id == merchant_in.category_id,
            Category.user_id == user_id
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found for the current user.")

    # Update the merchant data
    merchant.name = merchant_in.name
    merchant.category_id = merchant_in.category_id
    db.commit()
    db.refresh(merchant)
    return merchant

def delete_merchant(db: Session, merchant_id: int, user_id: int):
    # Ensure the merchant exists and belongs to the user before deleting
    merchant = db.query(Merchant).filter(
        Merchant.id == merchant_id,
        Merchant.user_id == user_id
    ).first()
    if merchant:
        db.delete(merchant)
        db.commit()
    return merchant