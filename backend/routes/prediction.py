import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from services.predictor import Predictor
from utils.security import decode_access_token
from utils.database import get_db
from models.scan_log import ScanLog

logger = logging.getLogger(__name__)

router = APIRouter()


class URLRequest(BaseModel):
    url: str


class SMSRequest(BaseModel):
    message: str


class EmailRequest(BaseModel):
    subject: str
    body: str
    sender: str
    recipient: str


class PredictionResponse(BaseModel):
    prediction: str
    risk_score: int
    confidence: float
    severity: str


def _get_user_id(token: str = Depends(lambda: "")):
    # Placeholder until JWT authentication is added
    return None


def _log_scan(
    db: Session,
    user_id: int | None,
    scan_type: str,
    input_data: str,
    prediction: str,
    risk_score: int,
    confidence: float,
):
    log = ScanLog(
        user_id=user_id,
        scan_type=scan_type,
        input_data=input_data,
        prediction=prediction,
        risk_score=risk_score,
        confidence=int(confidence * 100),
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


@router.post("/url", response_model=PredictionResponse)
async def predict_url(
    request: URLRequest,
    user_id: str = Depends(_get_user_id),
    db: Session = Depends(get_db),
):
    try:
        pred, confidence, risk, severity = Predictor.predict_url(request.url)

        _log_scan(
            db,
            None,
            "url",
            request.url,
            pred,
            risk,
            confidence,
        )

        return PredictionResponse(
            prediction=pred,
            risk_score=risk,
            confidence=confidence,
            severity=severity,
        )

    except FileNotFoundError as e:
        logger.error(f"URL model file not found: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Model file missing: {e}",
        )

    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {e}",
        )


@router.post("/sms", response_model=PredictionResponse)
async def predict_sms(
    request: SMSRequest,
    user_id: str = Depends(_get_user_id),
    db: Session = Depends(get_db),
):
    try:
        pred, confidence, risk, severity = Predictor.predict_sms(request.message)

        _log_scan(
            db,
            None,
            "sms",
            request.message,
            pred,
            risk,
            confidence,
        )

        return PredictionResponse(
            prediction=pred,
            risk_score=risk,
            confidence=confidence,
            severity=severity,
        )

    except FileNotFoundError as e:
        logger.error(f"SMS model file not found: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Model file missing: {e}",
        )

    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {e}",
        )


@router.post("/email", response_model=PredictionResponse)
async def predict_email(
    request: EmailRequest,
    user_id: str = Depends(_get_user_id),
    db: Session = Depends(get_db),
):
    try:
        content = (
            f"Subject: {request.subject}\n"
            f"From: {request.sender}\n"
            f"To: {request.recipient}\n\n"
            f"{request.body}"
        )

        pred, confidence, risk, severity = Predictor.predict_email(content)

        _log_scan(
            db,
            None,
            "email",
            content,
            pred,
            risk,
            confidence,
        )

        return PredictionResponse(
            prediction=pred,
            risk_score=risk,
            confidence=confidence,
            severity=severity,
        )

    except FileNotFoundError as e:
        logger.error(f"Email model file not found: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Model file missing: {e}",
        )

    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {e}",
        )
