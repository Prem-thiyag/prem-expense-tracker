# File: app/models/tag.py
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    
    #! CHANGE: Name is no longer globally unique
    name = Column(String, nullable=False, index=True)

    #! CHANGE: Add user_id column and relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="tags")

    transactions = relationship("TransactionTag", back_populates="tag", cascade="all, delete-orphan")

    # Add a constraint to ensure the tag name is unique per user
    __table_args__ = (UniqueConstraint('user_id', 'name', name='_user_id_name_uc'),)