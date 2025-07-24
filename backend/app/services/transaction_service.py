# File: app/services/transaction_service.py
from sqlalchemy.orm import Session, joinedload
from app.models.transaction import Transaction

def get_filtered_transactions(db: Session, filters: dict, user_id: int):
    page = filters.get("page", 1)
    limit = filters.get("limit", 10)
    start_date = filters.get("start_date")
    end_date = filters.get("end_date")
    category_id = filters.get("category_id")
    account_id = filters.get("account_id")
    search_term = filters.get("search_term")
    transaction_type = filters.get("type")
    
    sort_by = filters.get("sort_by", "txn_date")
    order = filters.get("order", "desc")

    # ✅ --- THIS IS THE FINAL FIX ---
    # We must tell `joinedload` to use the REAL relationship (`tags_association`),
    # not the virtual `association_proxy` (`tags`).
    # This will eagerly load the data needed for the proxy to work during serialization.
    query = db.query(Transaction).options(joinedload(Transaction.tags_association)).filter(Transaction.user_id == user_id)

    # Apply all other filters
    if start_date:
        query = query.filter(Transaction.txn_date >= start_date)
    if end_date:
        query = query.filter(Transaction.txn_date <= end_date)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    if search_term:
        query = query.filter(Transaction.description.ilike(f"%{search_term}%"))

    # Sorting logic
    sort_field = getattr(Transaction, sort_by, None)
    if sort_field:
        query = query.order_by(sort_field.desc() if order.lower() == "desc" else sort_field.asc())
    else:
        query = query.order_by(Transaction.txn_date.desc())

    total_count = query.count()
    transactions = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "transactions": transactions
    }