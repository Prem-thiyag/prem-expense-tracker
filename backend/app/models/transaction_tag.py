# File: app/models/transaction_tag.py
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class TransactionTag(Base):
    __tablename__ = "transaction_tags"

    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # ✅ THIS IS THE FIX
    # It now correctly points back to the `tags_association` property on the Transaction model.
    transaction = relationship("Transaction", back_populates="tags_association")
    
    # This relationship remains the same.
    tag = relationship("Tag", back_populates="transactions")