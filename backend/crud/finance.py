from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from models.finance import Finance, FinanceTransaction
from schemas.finance import FinanceCreate, FinanceUpdate, FinanceTransactionCreate

def get_current_week_finance(db: Session) -> Optional[Finance]:
    today = datetime.now()
    monday = today - timedelta(days=today.weekday())
    saturday = monday + timedelta(days=5)
    
    return db.query(Finance).filter(
        Finance.week_start <= today,
        Finance.week_end >= today
    ).first()

def create_finance(db: Session, finance: FinanceCreate) -> Finance:
    db_finance = Finance(**finance.dict())
    db.add(db_finance)
    db.commit()
    db.refresh(db_finance)
    return db_finance

def update_finance(db: Session, finance_id: int, finance: FinanceUpdate) -> Optional[Finance]:
    db_finance = db.query(Finance).filter(Finance.id == finance_id).first()
    if db_finance:
        for key, value in finance.dict().items():
            setattr(db_finance, key, value)
        db.commit()
        db.refresh(db_finance)
    return db_finance

def create_transaction(db: Session, transaction: FinanceTransactionCreate, user_id: int) -> FinanceTransaction:
    db_transaction = FinanceTransaction(**transaction.dict(), user_id=user_id)
    db.add(db_transaction)
    
    current_finance = get_current_week_finance(db)
    if current_finance:
        current_finance.total_amount -= transaction.amount
        db.add(current_finance)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def get_user_transactions(db: Session, user_id: int, limit: int = 3) -> List[FinanceTransaction]:
    return db.query(FinanceTransaction)\
        .filter(FinanceTransaction.user_id == user_id)\
        .order_by(FinanceTransaction.created_at.desc())\
        .limit(limit)\
        .all()

def get_all_transactions(db: Session, limit: int = 3) -> List[FinanceTransaction]:
    return db.query(FinanceTransaction)\
        .order_by(FinanceTransaction.created_at.desc())\
        .limit(limit)\
        .all() 