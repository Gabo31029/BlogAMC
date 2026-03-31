import httpx

from .config import settings


REST_URL = f"{settings.SUPABASE_URL}/rest/v1"
AUTH_URL = f"{settings.SUPABASE_URL}/auth/v1"
STORAGE_URL = f"{settings.SUPABASE_URL}/storage/v1"


def _headers(access_token: str | None = None) -> dict[str, str]:
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
    }
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    return headers


async def supabase_login_password(email: str, password: str) -> dict:
    url = f"{AUTH_URL}/token"
    params = {"grant_type": "password"}
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            url,
            params=params,
            json={"email": email, "password": password},
            headers=_headers(),
        )
        r.raise_for_status()
        return r.json()


async def storage_upload_object(
    *,
    access_token: str,
    bucket: str,
    object_path: str,
    file_bytes: bytes,
    content_type: str,
) -> str:
    """
    Sube un objeto al bucket (Storage REST) y devuelve su URL pública.
    """
    # Upload REST endpoint: POST /storage/v1/object/{bucket}/{path}
    url = f"{STORAGE_URL}/object/{bucket}/{object_path}"
    headers = _headers(access_token)
    headers["Content-Type"] = content_type

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(url, content=file_bytes, headers=headers)
        r.raise_for_status()

    # Si el bucket está configurado como “public”, esta URL funciona.
    # (Si no es public, lo cambiamos por signed URLs.)
    return f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{object_path}"


async def rest_select(path: str, *, access_token: str | None = None, params: dict | None = None):
    url = f"{REST_URL}/{path.lstrip('/')}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(url, headers=_headers(access_token), params=params)
        r.raise_for_status()
        return r.json()


async def rest_insert(path: str, *, access_token: str, payload: dict | list[dict]):
    url = f"{REST_URL}/{path.lstrip('/')}"
    headers = _headers(access_token)
    headers["Prefer"] = "return=representation"
    headers["Content-Type"] = "application/json"

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        return r.json()


async def rest_patch(path: str, *, access_token: str, params: dict, payload: dict):
    url = f"{REST_URL}/{path.lstrip('/')}"
    headers = _headers(access_token)
    headers["Prefer"] = "return=representation"
    headers["Content-Type"] = "application/json"

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.patch(url, headers=headers, params=params, json=payload)
        r.raise_for_status()
        return r.json()


async def rest_delete(path: str, *, access_token: str, params: dict):
    url = f"{REST_URL}/{path.lstrip('/')}"
    headers = _headers(access_token)
    headers["Prefer"] = "return=representation"

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.delete(url, headers=headers, params=params)
        r.raise_for_status()
        return r.json() if r.text else None

