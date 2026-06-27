from utils.database import SessionLocal
from models.user import User

async def get_user_by_email(email: str):
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()

async def create_user(email: str, hashed_password: str):
    db = SessionLocal()
    try:
        user = User(
            email=email,
            hashed_password=hashed_password
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()
