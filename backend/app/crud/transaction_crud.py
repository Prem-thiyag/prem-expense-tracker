# File: app/crud/transaction_crud.py
from sqlalchemy.orm import Session
import re
from thefuzz import process as fuzzy_process

from app.models.transaction import Transaction
from app.models.tag import Tag
from app.models.account import Account
from app.models.category import Category
from app.schemas.transaction_schema import TransactionCreate, TransactionUpdate
from app.services.alert_service import check_and_create_budget_alerts
from app.crud import alert_crud
from fastapi import HTTPException

# ✅ --- NEW HELPER FUNCTION ---
# This contains the smart categorization logic, now available to all transaction functions.
def _get_smart_category(db: Session, description: str, user_id: int):
    """
    Analyzes a transaction description to find a category ID.
    - Parses remarks like /category/.
    - Uses fuzzy matching and aliases.
    - Creates alerts for new, unrecognized categories.
    """
    # Define shorthands and common misspellings
    CATEGORY_ALIASES = { "miscellaneous": ["misc", "miscelleaneous"], "entertainment": ["ent"], "transportation": ["transport"] }
    
    user_categories_db = db.query(Category).filter(Category.user_id == user_id).all()
    user_categories_map = {cat.id: cat.name for cat in user_categories_db}

    # Create a reverse map for fuzzy matching: { "lowercase_name": id }
    choices = {}
    for cat_id, cat_name in user_categories_map.items():
        cat_name_lower = cat_name.lower()
        choices[cat_name_lower] = cat_id
        if cat_name_lower in CATEGORY_ALIASES:
            for alias in CATEGORY_ALIASES[cat_name_lower]:
                choices[alias] = cat_id

    # 1. Try to find a user remark like /category/
    remark_match = re.search(r'/([^/]+)/', description, re.IGNORECASE)
    if remark_match:
        user_remark = remark_match.group(1).lower().strip()
        
        # 2. Find the best match with a confidence score
        best_match = fuzzy_process.extractOne(user_remark, choices.keys())
        
        if best_match and best_match[1] >= 85: # 85% confidence threshold
            return choices[best_match[0]] # Return the matched category ID
        else:
            # 3. If no good match, create an alert for the potential new category
            alert_crud.create_new_category_alert(db, user_id=user_id, category_name=user_remark.title())
            
    # 4. If no remark was found or no match was made, return None
    return None


def create_transaction(db: Session, txn_in: TransactionCreate, user_id: int):
    account = db.query(Account).filter(Account.id == txn_in.account_id, Account.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found for the current user.")

    # ✅ --- SMART CATEGORIZATION HOOK ---
    detected_category_id = txn_in.category_id
    # If the user saved as "Uncategorized" (category_id is None), try to be smart.
    if not detected_category_id and txn_in.description:
        smart_id = _get_smart_category(db, txn_in.description, user_id)
        if smart_id:
            detected_category_id = smart_id

    txn_dict = txn_in.model_dump(exclude={"tag_ids"})
    # Use the detected_category_id, which will be the smart one if found, or None otherwise.
    txn = Transaction(**txn_dict, user_id=user_id, category_id=detected_category_id)

    if txn_in.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(txn_in.tag_ids), Tag.user_id == user_id).all()
        if len(tags) != len(set(txn_in.tag_ids)):
            raise HTTPException(status_code=400, detail="One or more tags are invalid or do not belong to the user.")
        for tag in tags:
            txn.tags_association.append(TransactionTag(tag=tag, user_id=user_id))
            
    db.add(txn)
    db.commit()
    db.refresh(txn)

    check_and_create_budget_alerts(db, user_id, txn)
    db.commit() 

    return txn

def update_transaction(db: Session, txn_id: int, txn_in: TransactionUpdate, user_id: int):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()
    if not txn:
        return None

    update_data = txn_in.model_dump(exclude_unset=True)
    
    # ✅ --- SMART CATEGORIZATION HOOK (for updates) ---
    # Check if the user is trying to set the category to "Uncategorized"
    if "category_id" in update_data and update_data["category_id"] is None:
        description = update_data.get("description", txn.description) # Use new description if available
        smart_id = _get_smart_category(db, description, user_id)
        if smart_id:
            update_data["category_id"] = smart_id

    for field, value in update_data.items():
        if field != "tag_ids":
            setattr(txn, field, value)

    if "tag_ids" in update_data:
        txn.tags_association = []
        db.flush()
        if update_data["tag_ids"]:
            tags = db.query(Tag).filter(Tag.id.in_(update_data["tag_ids"]), Tag.user_id == user_id).all()
            if len(tags) != len(set(update_data["tag_ids"])):
                raise HTTPException(status_code=400, detail="One or more tags are invalid or do not belong to the user.")
            for tag in tags:
                txn.tags_association.append(TransactionTag(tag=tag, user_id=user_id))

    db.commit()
    db.refresh(txn)

    check_and_create_budget_alerts(db, user_id, txn)
    db.commit()

    return txn

def get_transaction_by_id(db: Session, txn_id: int, user_id: int):
    return db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()

def delete_transaction(db: Session, txn_id: int, user_id: int):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == user_id).first()
    if txn:
        db.delete(txn)
        db.commit()
    return txn