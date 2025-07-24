# File: app/models/transaction.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from sqlalchemy.dialects.postgresql import JSON
# ✅ 1. Import the association_proxy
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
    
    upi_ref = Column(String, nullable=True)
    unique_key = Column(String, unique=True, nullable=True)
    raw_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # --- Relationships ---
    user = relationship("User", back_populates="transactions")
    account = relationship("Account")
    category = relationship("Category")
    merchant = relationship("Merchant", back_populates="transactions")

    # ✅ 2. THIS IS THE FIX
    # Step A: Define the relationship to the association table.
    # We rename the old 'tags' relationship to be more specific.
    tags_association = relationship("TransactionTag", back_populates="transaction", cascade="all, delete-orphan")

    # Step B: Create a clean, direct proxy to the 'Tag' model.
    # This creates a `transaction.tags` attribute that acts like a simple list of Tag objects.
    # It reads through `tags_association` and pulls out the `tag` attribute from each object.
    # This is what our Pydantic schemas will use for reading data.
    tags = association_proxy("tags_association", "tag")