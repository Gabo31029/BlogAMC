-- Reemplaza ADMIN_EMAIL con el email real del usuario “admin” en Supabase Auth.
-- Ejemplo: admin@example.com
-- (Puedes hacerlo antes de ejecutar la migración, o editar el archivo tal cual.)

-- 1) Extensiones
create extension if not exists pgcrypto;

-- 2) Tabla de posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  cover_image_url text,
  content_json jsonb not null default '{}'::jsonb,
  content_html text,
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- 3) RLS para posts
alter table public.posts enable row level security;

-- Lectura pública SOLO de publicadas
drop policy if exists "Public read published posts" on public.posts;
create policy "Public read published posts"
on public.posts
for select
using (published_at is not null);

-- Lectura para usuarios autenticados (para que el editor pueda cargar borradores)
drop policy if exists "Authenticated read posts" on public.posts;
create policy "Authenticated read posts"
on public.posts
for select
to authenticated
using (true);

-- Escritura solo para admin
-- Nota: auth.jwt()->>'email' debe coincidir con el email del admin en Supabase.
drop policy if exists "Admin insert posts" on public.posts;
create policy "Admin insert posts"
on public.posts
for insert
to authenticated
with check (auth.jwt()->>'email' = 'ADMIN_EMAIL');

drop policy if exists "Admin update posts" on public.posts;
create policy "Admin update posts"
on public.posts
for update
to authenticated
using (auth.jwt()->>'email' = 'ADMIN_EMAIL')
with check (auth.jwt()->>'email' = 'ADMIN_EMAIL');

drop policy if exists "Admin delete posts" on public.posts;
create policy "Admin delete posts"
on public.posts
for delete
to authenticated
using (auth.jwt()->>'email' = 'ADMIN_EMAIL');

-- 4) Bucket de imágenes
-- Asegúrate de reemplazar ADMIN_EMAIL antes de ejecutar.
insert into storage.buckets (id, name, public)
values ('blog-assets', 'blog-assets', true)
on conflict (id) do update set public = true;

-- 5) RLS para Storage
alter table storage.objects enable row level security;

drop policy if exists "Public read storage objects" on storage.objects;
create policy "Public read storage objects"
on storage.objects
for select
using (bucket_id = 'blog-assets');

drop policy if exists "Admin upload storage objects" on storage.objects;
create policy "Admin upload storage objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-assets'
  and auth.jwt()->>'email' = 'ADMIN_EMAIL'
);

drop policy if exists "Admin update storage objects" on storage.objects;
create policy "Admin update storage objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-assets'
  and auth.jwt()->>'email' = 'ADMIN_EMAIL'
)
with check (
  bucket_id = 'blog-assets'
  and auth.jwt()->>'email' = 'ADMIN_EMAIL'
);

drop policy if exists "Admin delete storage objects" on storage.objects;
create policy "Admin delete storage objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-assets'
  and auth.jwt()->>'email' = 'ADMIN_EMAIL'
);

