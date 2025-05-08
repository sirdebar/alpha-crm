from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database import get_db
from crud import finance as finance_crud
from schemas.finance import Finance, FinanceCreate, FinanceUpdate, FinanceTransaction, FinanceTransactionCreate
from auth import get_current_user

router = APIRouter(prefix="/api/finance", tags=["finance"])

@router.get("/current", response_model=Finance)
def get_current_week_finance(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    finance = finance_crud.get_current_week_finance(db)
    if not finance:
        today = datetime.now()
        monday = today - timedelta(days=today.weekday())
        saturday = monday + timedelta(days=5)
        finance = finance_crud.create_finance(
            db,
            FinanceCreate(
                total_amount=0,
                week_start=monday,
                week_end=saturday
            )
        )
    return finance

@router.put("/current", response_model=Finance)
def update_current_week_finance(
    finance: FinanceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    current_finance = finance_crud.get_current_week_finance(db)
    if not current_finance:
        raise HTTPException(status_code=404, detail="Current week finance not found")
    
    return finance_crud.update_finance(db, current_finance.id, finance)

@router.post("/transaction", response_model=FinanceTransaction)
def create_transaction(
    transaction: FinanceTransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    current_finance = finance_crud.get_current_week_finance(db)
    if not current_finance:
        raise HTTPException(status_code=404, detail="Current week finance not found")
    
    if transaction.amount > current_finance.total_amount:
        raise HTTPException(status_code=400, detail="Not enough money in the bank")
    
    return finance_crud.create_transaction(db, transaction, current_user.id)

@router.get("/transactions/my", response_model=List[FinanceTransaction])
def get_my_transactions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return finance_crud.get_user_transactions(db, current_user.id)

@router.get("/transactions/all", response_model=List[FinanceTransaction])
def get_all_transactions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return finance_crud.get_all_transactions(db) 