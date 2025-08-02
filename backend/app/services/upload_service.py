# File: app/services/upload_service.py
import pandas as pd
import json
import re
from sqlalchemy.orm import Session
from datetime import datetime
from thefuzz import process as fuzzy_process

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.models.merchant import Merchant
from app.models.tag import Tag
from app.crud import alert_crud

# --- DATA MAPPING RULES (No changes) ---
TRANSFER_KEYWORDS = {
    'v revathi', 't prem', 'satish p', 'mohan kumar a', 'putte gowda', 'naveen b', 'madhu c s', 'perumal p',
    'saroja', 'c vamsi krishna', 'vivek kumar', 'pavan k', 'kiran kumar k', 'manjunath', 'sagar', 'm anand',
    'semeema', 'sumith sigtia', 'thiyagarajan.su', 'yatha jain', 'kapil.loginhdi', 'amogh.dr7',
    'jerry10102002', 'shebak das', 'mrs janaki srinivasan',
}
MERCHANT_CATEGORY_RULES = {
    'zomato': ('Zomato', 'Food'), 'swiggy': ('Swiggy', 'Food'), 'udupi sannid': ('M S Sri Udupi Sannidhi', 'Food'),
    'eazypay.jzrwpsu': ('M S Sri Udupi Sannidhi', 'Food'), 'burma burm': ('Burma Burma', 'Food'),
    'little italy': ('Little Italy', 'Food'), 'wave cafe': ('Wave Cafe', 'Food'),
    'sarkaar hospitality': ('Sarkaar Hospitality', 'Food'), 'gopizza': ('GOPIZZA', 'Food'),
    'california burrito': ('California Burrito', 'Food'), 'bharatpe': ('BharatPe Merchant', 'Food'),
    'zepto': ('Zepto', 'Groceries'), 'bbinstant': ('BigBasket', 'Groceries'), 'bigbasket': ('BigBasket', 'Groceries'),
    'luludaily': ('Lulu Hypermarket', 'Groceries'), 'thavakkal bazaar': ('Thavakkal Bazaar', 'Groceries'),
    'bangalore metro rail': ('Namma Metro', 'Travel'), 'bmrc': ('Namma Metro', 'Travel'),
    'metro rail': ('Namma Metro', 'Travel'), 'uber': ('Uber', 'Travel'), 'redbus': ('Redbus', 'Travel'),
    'paytm travel': ('Paytm Travel', 'Travel'), 'irctc': ('IRCTC', 'Travel'), 'auto service': ('Auto Service', 'Travel'),
    'amazon': ('Amazon', 'Shopping'), 'amzn': ('Amazon', 'Shopping'), 'myntra': ('Myntra', 'Shopping'),
    'snitch': ('SNITCH', 'Shopping'), 'jockey': ('Jockey', 'Shopping'), 'lifestyle': ('Lifestyle', 'Shopping'),
    'findr management': ('Findr Management Solutions', 'Shopping'), 'stanzaliving': ('Stanza Living', 'Services'),
    'dtwelve spaces': ('Stanza Living', 'Services'), 'pg rent': ('PG Rent', 'Rent'), 'spotify': ('Spotify', 'Bills'),
    'microsoft': ('Microsoft', 'Bills'), 'alistetechnologies': ('Aliste Technologies', 'Services'),
    'airtel': ('Airtel', 'Bills'), 'healthandglow': ('Health & Glow', 'Health & Wellness'),
    'mass pharma': ('Pharmacy', 'Health & Wellness'), 'trustchemist': ('Pharmacy', 'Health & Wellness'),
    'hairtel': ('Hairtel Salon', 'Personal Care'), 'bookmyshow': ('BookMyShow', 'Entertainment'),
    'nova gamin': ('Nova Gaming', 'Entertainment'), 'financewithsharan': ('FinanceWithSharan', 'Education'),
}

# --- PARSING FUNCTIONS (No changes) ---
def parse_generic_statement(file, account_id, source, date_col, desc_col, debit_col, credit_col, ref_col=None, unique_id_col=None):
    try:
        df = pd.read_csv(file.file)
        clean_col = lambda c: c.strip().replace('.', '')
        df.columns = [clean_col(c) for c in df.columns]
        date_col, desc_col, debit_col, credit_col = map(clean_col, [date_col, desc_col, debit_col, credit_col])
        if ref_col: ref_col = clean_col(ref_col)
        if unique_id_col: unique_id_col = clean_col(unique_id_col)
    except Exception as e:
        print(f"Pandas could not read the CSV file for {source}. Error: {e}")
        return []
        
    transactions = []
    for index, row in df.iterrows():
        if pd.isna(row.get(date_col)): continue
        try:
            withdrawal_amt, deposit_amt = pd.to_numeric(row.get(debit_col), errors='coerce'), pd.to_numeric(row.get(credit_col), errors='coerce')
            withdrawal_amt, deposit_amt = (withdrawal_amt if pd.notna(withdrawal_amt) else 0.0), (deposit_amt if pd.notna(deposit_amt) else 0.0)
            if withdrawal_amt > 0: amount, txn_type = withdrawal_amt, 'debit'
            elif deposit_amt > 0: amount, txn_type = deposit_amt, 'credit'
            else: continue
            
            txn_date, description = pd.to_datetime(row[date_col], dayfirst=True), str(row[desc_col])
            upi_ref = re.search(r'(\d{12})', description).group(1) if 'UPI' in description and re.search(r'(\d{12})', description) else None
            unique_key_part = str(row[unique_id_col]) if unique_id_col and pd.notna(row.get(unique_id_col)) else (str(row.get(ref_col, '')) if ref_col else f"{description[:10]}-{index}")
            unique_key = f"{source}-{unique_key_part}-{txn_date.strftime('%Y%m%d')}-{amount:.2f}"

            transactions.append({'txn_date': txn_date, 'description': description, 'amount': amount, 'type': txn_type, 'account_id': account_id, 'source': source, 'upi_ref': upi_ref, 'unique_key': unique_key, 'raw_data': row.to_json(date_format='iso')})
        except Exception as e:
            print(f"Skipping row in {source} file due to error: {e}")
    return transactions

def parse_paytm_statement(file, account_map):
    try:
        df = pd.read_csv(file.file)
        df.columns = [c.strip() for c in df.columns]
    except Exception as e:
        print(f"Pandas could not read the CSV file for Paytm. Error: {e}")
        return []
    transactions = []
    for _, row in df.iterrows():
        if pd.isna(row.get('Date')) or "This is not included" in str(row.get('Remarks', '')): continue
        try:
            account_str = str(row['Your Account'])
            matched_account = next((acc_id for name, acc_id in account_map.items() if name in account_str), None)
            if not matched_account: continue
            
            source_provider = next((name for name, acc_id in account_map.items() if acc_id == matched_account), "Unknown")
            amount_val = pd.to_numeric(row.get('Amount'), errors='coerce')
            if pd.isna(amount_val) or amount_val == 0: continue
            amount, txn_type = abs(amount_val), 'credit' if amount_val > 0 else 'debit'
            txn_date = datetime.strptime(f"{row['Date']} {row['Time']}", '%d/%m/%Y %H:%M:%S')
            description = str(row['Transaction Details'])
            upi_ref = str(int(row['UPI Ref No.'])) if pd.notna(row['UPI Ref No.']) else None
            transactions.append({'txn_date': txn_date, 'description': description, 'amount': amount, 'type': txn_type, 'account_id': matched_account, 'source': source_provider, 'upi_ref': upi_ref, 'unique_key': None, 'raw_data': row.to_json(date_format='iso')})
        except Exception as e:
            print(f"Skipping Paytm row due to error: {e}")
    return transactions

# ✅ --- NEW HELPER LOGIC ---
CATEGORY_ALIASES = { "miscellaneous": ["misc", "miscelleaneous"], "entertainment": ["ent"], "transportation": ["transport"] }

def get_category_by_fuzzy_matching(remark: str, user_categories: dict) -> int | None:
    remark = remark.lower().strip()
    choices = {}
    for cat_id, cat_name in user_categories.items():
        cat_name_lower = cat_name.lower()
        choices[cat_name_lower] = cat_id
        if cat_name_lower in CATEGORY_ALIASES:
            for alias in CATEGORY_ALIASES[cat_name_lower]:
                choices[alias] = cat_id
    best_match = fuzzy_process.extractOne(remark, choices.keys())
    if best_match and best_match[1] >= 85: # 85% confidence threshold
        return choices[best_match[0]]
    return None

def process_and_insert_transactions(db: Session, transactions: list, user_id: int) -> int:
    existing_unique_keys = {res[0] for res in db.query(Transaction.unique_key).filter(Transaction.user_id == user_id, Transaction.unique_key.isnot(None)).all()}
    
    merchants_map = {m.name: m.id for m in db.query(Merchant).filter(Merchant.user_id == user_id).all()}
    user_categories_db = db.query(Category).filter(Category.user_id == user_id).all()
    user_categories_map = {cat.id: cat.name for cat in user_categories_db}
    
    inserted_count = 0
    newly_found_categories = set()

    for txn_data in sorted(transactions, key=lambda x: x['txn_date']):
        if (txn_data.get('unique_key') and txn_data['unique_key'] in existing_unique_keys):
            continue
            
        detected_merchant_id, detected_category_id = None, None
        desc = txn_data['description']
        
        # ✅ --- NEW: Smart categorization from user remarks ---
        remark_match = re.search(r'/([^/]+)/', desc, re.IGNORECASE)
        if remark_match:
            user_remark = remark_match.group(1)
            matched_id = get_category_by_fuzzy_matching(user_remark, user_categories_map)
            if matched_id:
                detected_category_id = matched_id
            else:
                newly_found_categories.add(user_remark.strip().title())

        # ✅ --- MODIFIED: Fallback logic if remark parsing fails ---
        if not detected_category_id:
            desc_lower = desc.lower()
            if any(keyword in desc_lower for keyword in TRANSFER_KEYWORDS):
                transfer_cat_id = next((_id for _id, name in user_categories_map.items() if name.lower() == 'transfers'), None)
                if transfer_cat_id: detected_category_id = transfer_cat_id
            else:
                for keyword, (merchant_name, category_name) in MERCHANT_CATEGORY_RULES.items():
                    if keyword in desc_lower:
                        detected_merchant_id = merchants_map.get(merchant_name)
                        cat_id = next((_id for _id, name in user_categories_map.items() if name.lower() == category_name.lower()), None)
                        if cat_id: detected_category_id = cat_id
                        if detected_merchant_id or detected_category_id: break
        
        # ✅ --- MODIFIED: Default to Miscellaneous if all else fails ---
        if not detected_category_id:
            misc_cat_id = next((_id for _id, name in user_categories_map.items() if name.lower() == 'miscellaneous'), None)
            if misc_cat_id: detected_category_id = misc_cat_id

        raw_data_json_str = txn_data.pop('raw_data', '{}')
        txn = Transaction(**txn_data, user_id=user_id, category_id=detected_category_id, merchant_id=detected_merchant_id, raw_data=json.loads(raw_data_json_str))
        db.add(txn)
        inserted_count += 1
        
        if txn_data.get('unique_key'): existing_unique_keys.add(txn_data['unique_key'])

    # ✅ --- NEW: Create alerts after processing all transactions ---
    for cat_name in newly_found_categories:
        alert_crud.create_new_category_alert(db, user_id=user_id, category_name=cat_name)

    # ✅ --- MODIFIED: Commit if new transactions OR new categories were found ---
    if inserted_count > 0 or newly_found_categories:
        db.commit()

    print(f"✅ Committed {inserted_count} new transactions and found {len(newly_found_categories)} new categories for user {user_id}.")
    return inserted_count