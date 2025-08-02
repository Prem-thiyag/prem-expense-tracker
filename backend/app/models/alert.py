# File: app/models/alert.py
from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime, Numeric, String
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Type of alert (e.g., 'budget', 'new_category')
    type = Column(String, default='budget', nullable=False)

    # For budget alerts, this will be set. For others, it can be null.
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="CASCADE"), nullable=True) 
    
    # For budget alerts
    threshold_percentage = Column(Numeric(5, 2), nullable=True)
    
    # A flexible field to store extra info, like a new category name
    context = Column(JSON, nullable=True)

    triggered_at = Column(DateTime, nullable=True)
    is_acknowledged = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    goal = relationship("Goal")