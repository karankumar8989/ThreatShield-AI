import csv
from io import BytesIO, StringIO
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from utils.database import get_db
from models.scan_log import ScanLog

from fpdf import FPDF

router = APIRouter()


class ReportRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    scan_type: str | None = None


def _fetch_logs(
    db: Session,
    start: datetime,
    end: datetime,
    scan_type: str | None
):
    query = db.query(ScanLog).filter(
        ScanLog.timestamp >= start,
        ScanLog.timestamp <= end
    )

    if scan_type:
        query = query.filter(
            ScanLog.scan_type == scan_type
        )

    return query.all()


@router.post("/pdf")
async def generate_pdf(
    report: ReportRequest,
    db: Session = Depends(get_db)
):
    logs = _fetch_logs(
        db,
        report.start_date,
        report.end_date,
        report.scan_type
    )

    if not logs:
        raise HTTPException(
            status_code=404,
            detail="No records found."
        )

    pdf = FPDF()

    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "ThreatShield AI Report", ln=True, align="C")

    pdf.ln(5)

    pdf.set_font("Helvetica", size=10)

    for log in logs:

        text = (
            f"Time: {log.timestamp}\n"
            f"Type: {log.scan_type}\n"
            f"Prediction: {log.prediction}\n"
            f"Risk Score: {log.risk_score}%\n"
            f"Confidence: {log.confidence}%\n"
            f"Input: {log.input_data}\n"
        )

        pdf.multi_cell(0, 6, text)
        pdf.ln(2)

    pdf_bytes = pdf.output(dest="S").encode("latin-1")

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=threat_report.pdf"
        }
    )


@router.post("/csv")
async def generate_csv(
    report: ReportRequest,
    db: Session = Depends(get_db)
):
    logs = _fetch_logs(
        db,
        report.start_date,
        report.end_date,
        report.scan_type
    )

    if not logs:
        raise HTTPException(
            status_code=404,
            detail="No records found."
        )

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Timestamp",
        "Scan Type",
        "Input",
        "Prediction",
        "Risk Score",
        "Confidence"
    ])

    for log in logs:
        writer.writerow([
            log.timestamp,
            log.scan_type,
            log.input_data,
            log.prediction,
            log.risk_score,
            log.confidence
        ])

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=threat_report.csv"
        }
    )
