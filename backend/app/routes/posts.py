import re
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from ..supabase_http import rest_delete, rest_insert, rest_patch, rest_select


router = APIRouter(prefix="/posts", tags=["posts"])


def _get_bearer_token(request: Request) -> str | None:
    auth = request.headers.get("authorization")
    if not auth:
        return None
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]


def _slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-")


class PostUpsertBody(BaseModel):
    title: str
    slug: str | None = None
    excerpt: str | None = None
    cover_image_url: str | None = None
    content_json: dict[str, Any]
    content_html: str
    published: bool = False


@router.get("")
async def list_published(request: Request):
    try:
        # Solo “publicadas”: mantenemos el filtro en backend (aunque RLS puede también restringir).
        payload = await rest_select(
            "posts",
            access_token=None,
            params={
                "select": "id,title,slug,excerpt,cover_image_url,published_at,updated_at",
                "order": "updated_at.desc",
                "published_at": "not.is.null",
            },
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error consultando Supabase (/posts): {e}")


@router.get("/{post_id}")
async def get_post(post_id: str, request: Request):
    token = _get_bearer_token(request)

    try:
        payload = await rest_select(
            "posts",
            access_token=token,
            params={
                "select": "id,title,slug,excerpt,cover_image_url,published_at,created_at,updated_at,content_json,content_html",
                "id": f"eq.{post_id}",
                "limit": 1,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error consultando Supabase (/posts/{post_id}): {e}")

    if not payload:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return payload[0]


@router.post("")
async def create_post(body: PostUpsertBody, request: Request):
    token = _get_bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")

    slug = body.slug or _slugify(body.title)
    published_at = datetime.utcnow().isoformat() + "Z" if body.published else None

    payload = await rest_insert(
        "posts",
        access_token=token,
        payload=[
            {
                "title": body.title,
                "slug": slug,
                "excerpt": body.excerpt,
                "cover_image_url": body.cover_image_url,
                "content_json": body.content_json,
                "content_html": body.content_html,
                "published_at": published_at,
            }
        ],
    )
    return payload[0] if isinstance(payload, list) and payload else payload


@router.patch("/{post_id}")
async def update_post(post_id: str, body: PostUpsertBody, request: Request):
    token = _get_bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")

    slug = body.slug or _slugify(body.title)
    published_at = datetime.utcnow().isoformat() + "Z" if body.published else None

    payload = await rest_patch(
        "posts",
        access_token=token,
        params={"id": f"eq.{post_id}"},
        payload={
            "title": body.title,
            "slug": slug,
            "excerpt": body.excerpt,
            "cover_image_url": body.cover_image_url,
            "content_json": body.content_json,
            "content_html": body.content_html,
            "published_at": published_at,
        },
    )
    return payload[0] if isinstance(payload, list) and payload else payload


@router.delete("/{post_id}")
async def delete_post(post_id: str, request: Request):
    token = _get_bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")

    payload = await rest_delete("posts", access_token=token, params={"id": f"eq.{post_id}"})
    return {"deleted": True, "result": payload}

