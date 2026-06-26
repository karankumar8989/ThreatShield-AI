from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from ..utils.security import (
    get_password_hash,
    verify_password,
    create_access_token
)

from ..services.user_service import (
    get_user_by_email,
    create_user
)

router = APIRouter()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest):
    existing = await get_user_by_email(payload.email)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed = get_password_hash(payload.password)

    user = await create_user(
        payload.email,
        hashed
    )

    token = create_access_token(
        {"sub": str(user.id)}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await get_user_by_email(payload.email)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        payload.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {"sub": str(user.id)}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }