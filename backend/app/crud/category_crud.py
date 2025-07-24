# File: app/crud/category_crud.py
from sqlalchemy.orm import Session
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category_schema import CategoryCreate, CategoryUpdate
from fastapi import HTTPException

#! CHANGE: All functions now require a user_id
def get_all_categories(db: Session, user_id: int):
    return db.query(Category).filter(Category.user_id == user_id).order_by(Category.name).all()

def create_category(db: Session, category_in: CategoryCreate, user_id: int):
    # Check for duplicates ONLY for the current user
    existing_by_name = db.query(Category).filter(Category.name == category_in.name, Category.user_id == user_id).first()
    if existing_by_name:
        raise HTTPException(status_code=409, detail="A category with this name already exists.")
    
    if category_in.icon_name:
        existing_by_icon = db.query(Category).filter(Category.icon_name == category_in.icon_name, Category.user_id == user_id).first()
        if existing_by_icon:
            raise HTTPException(status_code=409, detail=f"The icon '{category_in.icon_name}' is already in use by your '{existing_by_icon.name}' category.")

    # Automatically assign the category to the current user
    category = Category(**category_in.model_dump(), user_id=user_id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def update_category(db: Session, category_id: int, category_in: CategoryUpdate, user_id: int):
    # Ensure the user can only update their own category
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    if not category:
        return None
    
    update_data = category_in.model_dump(exclude_unset=True)

    if 'icon_name' in update_data and update_data['icon_name'] is not None:
        icon_name_to_check = update_data['icon_name']
        existing_by_icon = db.query(Category).filter(
            Category.icon_name == icon_name_to_check,
            Category.id != category_id,
            Category.user_id == user_id # Check only within the user's categories
        ).first()
        if existing_by_icon:
            raise HTTPException(status_code=409, detail=f"The icon '{icon_name_to_check}' is already in use by your '{existing_by_icon.name}' category.")

    for key, value in update_data.items():
        setattr(category, key, value)
    
    db.commit()
    db.refresh(category)
    return category

def delete_category(db: Session, category_id: int, user_id: int):
    # Ensure the user can only delete their own category
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    if category:
        # Un-categorize transactions for this user that used this category
        db.query(Transaction).filter(
            Transaction.category_id == category_id, 
            Transaction.user_id == user_id
        ).update({Transaction.category_id: None}, synchronize_session=False)
        db.delete(category)
        db.commit()
    return category