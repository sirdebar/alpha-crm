from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FinanceBase(BaseModel):
    total_amount: float

class FinanceCreate(FinanceBase):
    week_start: datetime
    week_end: datetime

class FinanceUpdate(FinanceBase):
    pass

class Finance(FinanceBase):
    id: int
    week_start: datetime
    week_end: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FinanceTransactionBase(BaseModel):
    amount: float
    reason: str

class FinanceTransactionCreate(FinanceTransactionBase):
    pass

class FinanceTransaction(FinanceTransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True 