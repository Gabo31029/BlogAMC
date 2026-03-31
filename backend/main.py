from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.posts import router as posts_router
from app.routes.uploads import router as uploads_router
from app.config import settings


app = FastAPI(title="BLOGAMC API", version="0.1.0")

origins = [o.strip() for o in (settings.CORS_ORIGINS or "*").split(",") if o.strip()]
allow_all = origins == ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False if allow_all else True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"ok": True}


app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(uploads_router)

