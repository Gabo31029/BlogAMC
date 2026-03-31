from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str

    # Usuario ADMIN en Supabase (Auth por email/password).
    SUPABASE_ADMIN_EMAIL: str
    SUPABASE_ADMIN_PASSWORD: str

    # Credenciales del login simple del blog.
    BLOG_ADMIN_USERNAME: str = "admin"
    BLOG_ADMIN_PASSWORD: str = "password"

    SUPABASE_STORAGE_BUCKET: str = "blog-assets"

    # Lista separada por comas (ej: http://localhost:5173,https://tusitio.com)
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

