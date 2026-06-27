from fastapi import FastAPI, Depends
from utils.database import Base, engine

# Import routers after they are defined
from .routes import auth, prediction, analytics, reports

app = FastAPI(title="ThreatShield AI API", version="0.1.0")

# CORS already configured in previous app.py (this is the same file, we will replace it)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(prediction.router, prefix="/predict", tags=["prediction"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])

@app.on_event("startup")
async def startup_event():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
@app.get("/")
async def root():
    return {
        "message": "ThreatShield AI Backend Running Successfully"
    }
