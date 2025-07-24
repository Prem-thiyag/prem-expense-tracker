# File: app/models/category.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_income = Column(Boolean, default=False)
    icon_name = Column(String(50), nullable=True)

    goals = relationship("Goal", back_populates="category")
    
    #! CHANGE: Add user_id column and relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="categories")