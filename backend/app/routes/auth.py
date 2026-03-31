from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..config import settings
from ..supabase_http import supabase_login_password


router = APIRouter(prefix="/auth", tags=["auth"])


class LoginBody(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(body: LoginBody):
    if body.username != settings.BLOG_ADMIN_USERNAME or body.password != settings.BLOG_ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    try:
        supa_tokens = await supabase_login_password(
            email=settings.SUPABASE_ADMIN_EMAIL,
            password=settings.SUPABASE_ADMIN_PASSWORD,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error autenticando contra Supabase: {e}")

    return supa_tokens

