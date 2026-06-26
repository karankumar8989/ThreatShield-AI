from sqlalchemy import Column, Integer, String, DateTime, func
from ..utils.database import Base

class ScanLog(Base):
    __tablename__ = "scan_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    scan_type = Column(String, nullable=False)  # url, sms, email
    input_data = Column(String, nullable=False)
    prediction = Column(String, nullable=False)
    risk_score = Column(Integer, nullable=False)
    confidence = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
