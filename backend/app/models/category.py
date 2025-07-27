# File: app/models/category.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    is_income = Column(Boolean, default=False)
    icon_name = Column(String(50), nullable=True)

    goals = relationship("Goal", back_populates="category")
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="categories")

    # This constraint ensures the category name is unique per user
    __table_args__ = (UniqueConstraint('user_id', 'name', name='_user_id_category_name_uc'),)