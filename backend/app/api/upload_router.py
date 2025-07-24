# File: app/api/upload_router.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import upload_service
from app.models.account import Account
from app.models.user import User
from app.core import deps
from typing import List

router = APIRouter()

#! CHANGE: Protect route and scope all operations to the current user
@router.post("/upload-statements")
def upload_statements(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    files: List[UploadFile] = File(..., description="A list of bank statement CSV files to upload.")
):
    """
    Uploads one or more bank statement files for the authenticated user, 
    parses them, and inserts new, non-duplicate transactions into the database.
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one statement file must be uploaded.")

    # Fetch the account map ONLY for the current user
    user_accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    account_map = {acc.name: acc.id for acc in user_accounts}
    
    if not account_map:
        raise HTTPException(status_code=400, detail="No accounts configured for your profile. Please add an account in Settings before uploading.")

    all_txns = []
    processed_files = []

    try:
        for file in files:
            filename = file.filename.lower() if file.filename else ""
            
            # This logic remains the same, but the `account_map` is now user-specific
            if 'hdfc' in filename:
                if "HDFC Bank" not in account_map:
                    print(f"Skipping HDFC file for user {current_user.id}: HDFC Bank account not configured.")
                    continue
                txns = upload_service.parse_generic_statement(
                    file=file, account_id=account_map["HDFC Bank"], source="HDFC",
                    date_col="Date", desc_col="Narration", debit_col="Withdrawal Amt",
                    credit_col="Deposit Amt", ref_col="Chq/RefNo"
                )
                all_txns.extend(txns)

            elif 'icici' in filename:
                if "ICICI Bank" not in account_map:
                    print(f"Skipping ICICI file for user {current_user.id}: ICICI Bank account not configured.")
                    continue
                txns = upload_service.parse_generic_statement(
                    file=file, account_id=account_map["ICICI Bank"], source="ICICI",
                    date_col="Value Date", desc_col="Transaction Remarks", debit_col="Withdrawal Amount (INR )",
                    credit_col="Deposit Amount (INR )", ref_col="Cheque Number", unique_id_col="S No."
                )
                all_txns.extend(txns)

            elif 'paytm' in filename:
                txns = upload_service.parse_paytm_statement(file=file, account_map=account_map)
                all_txns.extend(txns)
            else:
                print(f"Skipping unknown file type for user {current_user.id}: {file.filename}")
            
            processed_files.append(file)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during file parsing: {e}")
    finally:
        for f in processed_files:
            f.file.close()

    if not all_txns:
        raise HTTPException(status_code=400, detail="The uploaded file(s) did not contain any valid transactions to process for your configured accounts.")

    # Pass the user_id to the final processing function
    inserted_count = upload_service.process_and_insert_transactions(db, all_txns, user_id=current_user.id)
    
    return {"message": f"Upload successful. Found {len(all_txns)} potential transactions and inserted {inserted_count} new records."}