# File: app/models/account.py
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base 

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    account_number = Column(String, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="accounts")

    # This constraint ensures the account name is unique per user
    __table_args__ = (UniqueConstraint('user_id', 'name', name='_user_id_account_name_uc'),)