# File: app/models/transaction.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.ext.associationproxy import association_proxy

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    txn_date = Column(DateTime, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    source = Column(String, nullable=False)

    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    upi_ref = Column(String, nullable=True, index=True)
    unique_key = Column(String, nullable=True, index=True) 

    raw_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # --- Relationships (No changes here) ---
    user = relationship("User", back_populates="transactions")
    account = relationship("Account")
    category = relationship("Category")
    merchant = relationship("Merchant", back_populates="transactions")

    tags_association = relationship("TransactionTag", back_populates="transaction", cascade="all, delete-orphan")
    tags = association_proxy("tags_association", "tag")

    # ✅ --- THIS IS THE FIX ---
    # We now ONLY enforce uniqueness on the combination of user_id and our constructed unique_key.
    # The constraint on upi_ref has been removed.
    __table_args__ = (
        UniqueConstraint('user_id', 'unique_key', name='_user_id_unique_key_uc'),
    )