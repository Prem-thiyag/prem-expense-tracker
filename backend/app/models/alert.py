# File: app/models/alert.py
from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="CASCADE"), nullable=False)
    threshold_percentage = Column(Numeric(5, 2), nullable=False)
    triggered_at = Column(DateTime, nullable=True)
    is_acknowledged = Column(Boolean, default=False)

    #! CHANGE: Add user_id column for direct querying and security
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    goal = relationship("Goal")
    # Note: A back-populates to the User model is optional here.