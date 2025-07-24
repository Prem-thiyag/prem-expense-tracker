# File: app/api/tag_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.tag_schema import TagOut, TagCreate, TagUpdate
from app.crud import tag_crud
from app.core import deps
from app.models.user import User

# No redirect_slashes needed
router = APIRouter()

#! CHANGE: The path is now "" instead of "/".
@router.get("", response_model=List[TagOut])
def list_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return tag_crud.get_all_tags(db, user_id=current_user.id)

#! CHANGE: The path is now "" instead of "/".
@router.post("", response_model=TagOut, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag_in: TagCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    try:
        return tag_crud.create_tag(db, tag_in=tag_in, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

# Routes with path parameters are fine and do not need changes.
@router.put("/{tag_id}", response_model=TagOut)
def update_tag(
    tag_id: int, 
    tag_in: TagUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    try:
        tag = tag_crud.update_tag(db, tag_id=tag_id, tag_in=tag_in, user_id=current_user.id)
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        return tag
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.delete("/{tag_id}", response_model=TagOut)
def delete_tag(
    tag_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    tag = tag_crud.delete_tag(db, tag_id=tag_id, user_id=current_user.id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag