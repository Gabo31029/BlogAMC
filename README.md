# BLOGAMC (CRUD con editor estilo Notion + Supabase + FastAPI)

Proyecto fullstack para un blog con:
- Frontend: React + Tailwind + Tiptap (editor tipo Notion)
- Backend: FastAPI (CRUD + uploads hacia Supabase Storage)
- Datos: Supabase Postgres + Storage (con RLS)

## 1) Configura Supabase

1. Ejecuta la migración:
   - `supabase/migrations/001_posts_and_storage.sql`
2. En el SQL, reemplaza `ADMIN_EMAIL` por el email real del usuario admin en Supabase Auth.
   - Ejemplo: `admin@example.com`
3. Verifica que exista el bucket de Storage `blog-assets` con lectura pública (la migración lo intenta).

## 2) Backend (FastAPI)

1. Crea `backend/.env` a partir de `backend/.env.example` y completa:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_ADMIN_EMAIL`
   - `SUPABASE_ADMIN_PASSWORD`
   - `BLOG_ADMIN_USERNAME` (por defecto `admin`)
   - `BLOG_ADMIN_PASSWORD` (por defecto `password`)
2. Instala dependencias:
   - `pip install -r backend/requirements.txt`
3. Ejecuta:
   - `uvicorn backend.main:app --reload --port 8000`

Endpoints principales:
- `POST /auth/login`
- `GET /posts`
- `GET /posts/{id}`
- `POST /posts`
- `PATCH /posts/{id}`
- `DELETE /posts/{id}`
- `POST /uploads/image` (para subir imágenes pegadas)

## 3) Frontend (React)

1. Crea `frontend/.env` a partir de `frontend/.env.example` (por defecto `http://localhost:8000`)
2. Instala:
   - `cd frontend && npm install`
3. Ejecuta:
   - `npm run dev`

## 4) Uso

1. Abre la app.
2. Entra a `/login` e inicia sesión con:
   - Usuario: `admin`
   - Password: `password`
3. Edita desde `/editor/new`, crea contenido y pega imágenes con `Ctrl+V`.
4. La galería (`/`) muestra posts publicados.

> Nota: el editor hace autosave con debounce y renderiza en vivo en split view.

