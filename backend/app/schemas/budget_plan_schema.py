from pydantic import BaseModel
from typing import List

class BudgetItem(BaseModel):
    category_id: int
    limit_amount: float

class BudgetPlanUpdate(BaseModel):
    month: str  # Format: YYYY-MM
    budgets: List[BudgetItem]
