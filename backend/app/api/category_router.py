# File: app/api/category_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.crud import category_crud
from app.schemas.category_schema import CategoryCreate, CategoryOut, CategoryUpdate
from app.core import deps
from app.models.user import User

# Remove redirect_slashes=False, it's not needed with this fix.
router = APIRouter()

#! CHANGE: The path is now "" for POST and GET-all.
@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return category_crud.create_category(db, category_in=category_in, user_id=current_user.id)

@router.get("", response_model=List[CategoryOut])
def read_all_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return category_crud.get_all_categories(db, user_id=current_user.id)

# Routes with path parameters like "/{category_id}" do not need changing.
@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int, 
    category_in: CategoryUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    category = category_crud.update_category(db, category_id=category_id, category_in=category_in, user_id=current_user.id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found or you do not have permission to edit it")
    return category

@router.delete("/{category_id}", response_model=CategoryOut)
def delete_category(
    category_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    category = category_crud.delete_category(db, category_id=category_id, user_id=current_user.id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found or you do not have permission to delete it")
    return category