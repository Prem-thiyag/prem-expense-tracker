from sqlalchemy import create_engine
from app.models import Base
from app.db.session import get_db_url

def create_test_db():
    print("Creating Test DB tables...")
    test_engine = create_engine(get_db_url(test_mode=True))
    Base.metadata.create_all(bind=test_engine)

if __name__ == "__main__":
    create_test_db()
