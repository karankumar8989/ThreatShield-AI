import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from utils.database import get_db
from models.scan_log import ScanLog
from fpdf import FPDF
import csv
from io import BytesIO
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class ReportRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    scan_type: str | None = None

def _fetch_logs(db: Session, start: datetime, end: datetime, scan_type: str | None):
    query = db.query(ScanLog).filter(ScanLog.timestamp >= start, ScanLog.timestamp <= end)
    if scan_type:
        query = query.filter(ScanLog.scan_type == scan_type)
    return query.all()

@router.post("/pdf")
async def generate_pdf(report: ReportRequest, db: Session = Depends(get_db)):
    logs = _fetch_logs(db, report.start_date, report.end_date, report.scan_type)
    if not logs:
        raise HTTPException(status_code=404, detail="No records found for the given period")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="ThreatShield AI Report", ln=True, align='C')
    pdf.ln(10)
    for log in logs:
        line = f"{log.timestamp.isoformat()} | {log.scan_type.upper()} | {log.input_data[:30]}... | {log.prediction} | Risk:{log.risk_score}%"
        pdf.cell(0, 10, txt=line, ln=True)
    buffer = BytesIO()
    pdf.output(buffer)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=threat_report.pdf"})

@router.post("/csv")
async def generate_csv(report: ReportRequest, db: Session = Depends(get_db)):
    logs = _fetch_logs(db, report.start_date, report.end_date, report.scan_type)
    if not logs:
        raise HTTPException(status_code=404, detail="No records found for the given period")
    output = BytesIO()
    writer = csv.writer(output)
    writer.writerow(["timestamp", "scan_type", "input_data", "prediction", "risk_score", "confidence"])
    for log in logs:
        writer.writerow([
            log.timestamp.isoformat(),
            log.scan_type,
            log.input_data,
            log.prediction,
            log.risk_score,
            log.confidence,
        ])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=threat_report.csv"})
