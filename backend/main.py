from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .app.routes.auth import router as auth_router
from .app.routes.posts import router as posts_router
from .app.routes.uploads import router as uploads_router


app = FastAPI(title="BLOGAMC API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"ok": True}


app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(uploads_router)

