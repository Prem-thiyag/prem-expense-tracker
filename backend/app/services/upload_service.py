# File: app/services/upload_service.py
import pandas as pd
import json
import re
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.models.merchant import Merchant
from app.models.tag import Tag

# --- DATA MAPPING RULES (No changes here, they are universal) ---
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

# --- PARSING FUNCTIONS (These do not need user_id as they just process files) ---
# Note: No changes are needed in the individual parsing functions like `parse_generic_statement`
# and `parse_paytm_statement`. They simply convert file rows into a dictionary format.
# The user-scoping happens in `process_and_insert_transactions`.

def parse_generic_statement(file, account_id, source, date_col, desc_col, debit_col, credit_col, ref_col=None, unique_id_col=None):
    try:
        df = pd.read_csv(file.file)
        df.columns = [c.strip().replace('.', '') for c in df.columns]
    except Exception as e:
        print(f"Pandas could not read the CSV file for {source}. Error: {e}")
        return []
    transactions = []
    for index, row in df.iterrows():
        if pd.isna(row.get(date_col)): continue
        try:
            withdrawal_amt = pd.to_numeric(row.get(debit_col), errors='coerce')
            deposit_amt = pd.to_numeric(row.get(credit_col), errors='coerce')
            withdrawal_amt = withdrawal_amt if pd.notna(withdrawal_amt) else 0.0
            deposit_amt = deposit_amt if pd.notna(deposit_amt) else 0.0
            if withdrawal_amt > 0:
                amount, txn_type = withdrawal_amt, 'debit'
            elif deposit_amt > 0:
                amount, txn_type = deposit_amt, 'credit'
            else: continue
            
            txn_date = pd.to_datetime(row[date_col], dayfirst=True)
            description = str(row[desc_col])

            upi_ref = None
            if 'UPI' in description:
                match = re.search(r'(\d{12})', description)
                if match:
                    upi_ref = match.group(1)

            if unique_id_col and pd.notna(row.get(unique_id_col)):
                unique_key_part = str(row[unique_id_col])
            else:
                unique_key_part = str(row.get(ref_col, '')) if ref_col else f"{description[:10]}-{index}"

            unique_key = f"{source}-{unique_key_part}-{txn_date.strftime('%Y%m%d')}-{amount:.2f}"

            transactions.append({
                'txn_date': txn_date, 'description': description, 'amount': amount,
                'type': txn_type, 'account_id': account_id, 'source': source,
                'upi_ref': upi_ref, 'unique_key': unique_key, 'raw_data': row.to_json(date_format='iso')
            })
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
            # Match account_id from the user's specific account_map
            matched_account = next((acc_id for name, acc_id in account_map.items() if name in account_str), None)
            if not matched_account: continue
            
            # Find the source provider based on which account was matched
            source_provider = next((name for name, acc_id in account_map.items() if acc_id == matched_account), "Unknown")

            amount_val = pd.to_numeric(row.get('Amount'), errors='coerce')
            amount_val = amount_val if pd.notna(amount_val) else 0.0
            if amount_val == 0: continue
            amount, txn_type = abs(amount_val), 'credit' if amount_val > 0 else 'debit'
            txn_date = datetime.strptime(f"{row['Date']} {row['Time']}", '%d/%m/%Y %H:%M:%S')
            description = str(row['Transaction Details'])
            upi_ref = str(int(row['UPI Ref No.'])) if pd.notna(row['UPI Ref No.']) else None
            transactions.append({
                'txn_date': txn_date, 'description': description, 'amount': amount,
                'type': txn_type, 'account_id': matched_account, 'source': source_provider,
                'upi_ref': upi_ref, 'unique_key': None, 'raw_data': row.to_json(date_format='iso')
            })
        except Exception as e:
            print(f"Skipping Paytm row due to error: {e}")
    return transactions

#! CHANGE: Main processing function now requires user_id
def process_and_insert_transactions(db: Session, transactions: list, user_id: int) -> int:
    # Fetch existing data ONLY for the current user to prevent duplicates
    existing_upi_refs = {res[0] for res in db.query(Transaction.upi_ref).filter(Transaction.user_id == user_id, Transaction.upi_ref.isnot(None)).all()}
    existing_unique_keys = {res[0] for res in db.query(Transaction.unique_key).filter(Transaction.user_id == user_id, Transaction.unique_key.isnot(None)).all()}
    
    # Fetch maps for merchants and categories that belong to the current user
    merchants_map = {m.name: m.id for m in db.query(Merchant).filter(Merchant.user_id == user_id).all()}
    categories_map = {c.name: c.id for c in db.query(Category).filter(Category.user_id == user_id).all()}
    
    inserted_count = 0
    for txn_data in sorted(transactions, key=lambda x: x['txn_date']):
        # Check for duplicates within the user's transaction history
        if (txn_data.get('upi_ref') and str(txn_data['upi_ref']) in existing_upi_refs) or \
           (txn_data.get('unique_key') and txn_data['unique_key'] in existing_unique_keys):
            continue
            
        detected_merchant_id, detected_category_id = None, categories_map.get('Miscellaneous')
        desc_lower = txn_data['description'].lower()
        if any(keyword in desc_lower for keyword in TRANSFER_KEYWORDS):
            detected_category_id = categories_map.get('Transfers')
        else:
            for keyword, (merchant_name, category_name) in MERCHANT_CATEGORY_RULES.items():
                if keyword in desc_lower:
                    detected_merchant_id = merchants_map.get(merchant_name) # This can be extended to auto-create merchants
                    detected_category_id = categories_map.get(category_name)
                    if detected_merchant_id or detected_category_id:
                        break

        # Create the transaction and assign it to the current user
        txn = Transaction(
            **txn_data, # Unpack the parsed data
            user_id=user_id,
            category_id=detected_category_id, 
            merchant_id=detected_merchant_id,
            raw_data=json.loads(txn_data.get('raw_data', '{}'))
        )
        db.add(txn)
        inserted_count += 1
        
        # Add the new keys to the set to avoid duplicate insertions within the same batch
        if txn_data.get('upi_ref'):
            existing_upi_refs.add(txn_data['upi_ref'])
        if txn_data.get('unique_key'):
            existing_unique_keys.add(txn_data['unique_key'])

    if inserted_count > 0:
        db.commit()
        print(f"✅ Committed {inserted_count} new transactions to the database for user {user_id}.")
    else:
        print(f"ℹ️ No new transactions found to insert for user {user_id}.")
    return inserted_count