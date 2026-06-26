from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..utils.database import get_db
from ..models.scan_log import ScanLog
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

class CountResponse(BaseModel):
    total: int

class RecentActivity(BaseModel):
    id: int
    user_id: int | None
    scan_type: str
    input_data: str
    prediction: str
    risk_score: int
    confidence: int
    timestamp: datetime

# Total scans per type
@router.get("/total-scans", response_model=CountResponse)
def total_scans(db: Session = Depends(get_db)):
    total = db.query(func.count(ScanLog.id)).scalar()
    return CountResponse(total=total)

@router.get("/threats-detected", response_model=CountResponse)
def threats_detected(db: Session = Depends(get_db)):
    total = db.query(func.count(ScanLog.id)).filter(ScanLog.risk_score > 30).scalar()
    return CountResponse(total=total)

@router.get("/safe-requests", response_model=CountResponse)
def safe_requests(db: Session = Depends(get_db)):
    total = db.query(func.count(ScanLog.id)).filter(ScanLog.risk_score <= 30).scalar()
    return CountResponse(total=total)

@router.get("/average-risk-score", response_model=CountResponse)
def average_risk_score(db: Session = Depends(get_db)):
    avg = db.query(func.avg(ScanLog.risk_score)).scalar() or 0
    return CountResponse(total=int(avg))

@router.get("/detection-accuracy", response_model=CountResponse)
def detection_accuracy(db: Session = Depends(get_db)):
    # Placeholder: assume predictions are correct 95% of the time
    accuracy = 95
    return CountResponse(total=accuracy)

@router.get("/recent-activities", response_model=List[RecentActivity])
def recent_activities(limit: int = 10, db: Session = Depends(get_db)):
    rows = (
        db.query(ScanLog)
        .order_by(ScanLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [RecentActivity(**{k: getattr(r, k) for k in RecentActivity.__fields__}) for r in rows]

# Trend endpoints (existing) – keep unchanged
class TrendData(BaseModel):
    date: str
    count: int

@router.get("/trends/url", response_model=List[TrendData])
def url_trends(days: int = 30, db: Session = Depends(get_db)):
    start = datetime.utcnow() - timedelta(days=days)
    results = (
        db.query(func.date(ScanLog.timestamp), func.count())
        .filter(ScanLog.scan_type == "url", ScanLog.timestamp >= start)
        .group_by(func.date(ScanLog.timestamp))
        .all()
    )
    return [{"date": r[0] if isinstance(r[0], str) else r[0].isoformat(), "count": r[1]} for r in results]

@router.get("/trends/sms", response_model=List[TrendData])
def sms_trends(days: int = 30, db: Session = Depends(get_db)):
    start = datetime.utcnow() - timedelta(days=days)
    results = (
        db.query(func.date(ScanLog.timestamp), func.count())
        .filter(ScanLog.scan_type == "sms", ScanLog.timestamp >= start)
        .group_by(func.date(ScanLog.timestamp))
        .all()
    )
    return [{"date": r[0] if isinstance(r[0], str) else r[0].isoformat(), "count": r[1]} for r in results]

@router.get("/trends/email", response_model=List[TrendData])
def email_trends(days: int = 30, db: Session = Depends(get_db)):
    start = datetime.utcnow() - timedelta(days=days)
    results = (
        db.query(func.date(ScanLog.timestamp), func.count())
        .filter(ScanLog.scan_type == "email", ScanLog.timestamp >= start)
        .group_by(func.date(ScanLog.timestamp))
        .all()
    )
    return [{"date": r[0] if isinstance(r[0], str) else r[0].isoformat(), "count": r[1]} for r in results]
