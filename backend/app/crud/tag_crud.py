# File: app/crud/tag_crud.py
from sqlalchemy.orm import Session
from app.models.tag import Tag
from app.schemas.tag_schema import TagCreate, TagUpdate
from fastapi import HTTPException

#! CHANGE: All functions now require a user_id
def get_all_tags(db: Session, user_id: int):
    return db.query(Tag).filter(Tag.user_id == user_id).all()

def get_tag_by_id(db: Session, tag_id: int, user_id: int):
    return db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == user_id).first()

def get_tag_by_name(db: Session, name: str, user_id: int):
    return db.query(Tag).filter(Tag.name == name, Tag.user_id == user_id).first()

def create_tag(db: Session, tag_in: TagCreate, user_id: int):
    # Check for uniqueness within the current user's tags
    existing = get_tag_by_name(db, tag_in.name, user_id)
    if existing:
        raise ValueError(f"You already have a tag named '{tag_in.name}'.")
    
    # Assign the tag to the current user
    tag = Tag(**tag_in.model_dump(), user_id=user_id)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag

def update_tag(db: Session, tag_id: int, tag_in: TagUpdate, user_id: int):
    # Ensure the tag belongs to the current user
    tag = get_tag_by_id(db, tag_id, user_id)
    if not tag:
        return None
    
    # Check if the new name is already taken by another tag of the same user
    if tag_in.name != tag.name:
        existing = get_tag_by_name(db, tag_in.name, user_id)
        if existing:
            raise ValueError(f"You already have a tag named '{tag_in.name}'.")

    tag.name = tag_in.name
    db.commit()
    db.refresh(tag)
    return tag

def delete_tag(db: Session, tag_id: int, user_id: int):
    # Ensure the tag belongs to the current user before deleting
    tag = get_tag_by_id(db, tag_id, user_id)
    if not tag:
        return None
    
    # Deleting the tag will automatically delete the TransactionTag mappings
    # because of the `cascade="all, delete-orphan"` setting in the Tag model.
    db.delete(tag)
    db.commit()
    return tag