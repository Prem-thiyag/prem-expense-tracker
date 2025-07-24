# File: app/models/merchant.py
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    
    #! CHANGE: Name is now scoped to a user
    name = Column(String, nullable=False, index=True)
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    #! CHANGE: Add user_id column and relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Note: A back-populates to User is not strictly needed here unless you frequently query user.merchants
    
    transactions = relationship("Transaction", back_populates="merchant")

    # Add a constraint to ensure the merchant name is unique per user
    __table_args__ = (UniqueConstraint('user_id', 'name', name='_user_id_merchant_name_uc'),)