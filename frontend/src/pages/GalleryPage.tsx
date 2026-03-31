import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { listPublishedPosts, type Post } from '../lib/posts'
import { isAuthenticated } from '../lib/auth'

export default function GalleryPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    listPublishedPosts()
      .then((data) => {
        if (!mounted) return
        setPosts(data)
      })
      .catch((e) => {
        if (!mounted) return
        setError(String(e?.message ?? e))
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <header className="mx-auto max-w-6xl px-6 pt-28 pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
            <p className="mt-1 text-zinc-600">Publicaciones recientes</p>
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated()) navigate('/login')
              else navigate('/editor/new')
            }}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
          >
            Nuevo post
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-12">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : posts === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <article
                key={i}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <div className="h-36 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200" />
                <div className="p-4">
                  <div className="h-5 w-4/5 rounded bg-zinc-100 animate-pulse" />
                  <div className="mt-3 h-3 w-full rounded bg-zinc-100 animate-pulse" />
                  <div className="mt-2 h-3 w-11/12 rounded bg-zinc-100 animate-pulse" />
                </div>
              </article>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-600">
            No hay posts publicados todavía.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md hover:border-zinc-300"
              >
                <div className="relative h-36 bg-gradient-to-br from-zinc-100 to-zinc-200">
                  {p.cover_image_url ? (
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h2 className="text-base font-semibold tracking-tight">
                    <Link to={`/post/${p.id}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
                    {p.excerpt ?? '—'}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Link
                      to={`/post/${p.id}`}
                      className="text-sm font-medium text-zinc-900 hover:underline"
                    >
                      Leer
                    </Link>
                    {isAuthenticated() ? (
                      <Link
                        to={`/editor/${p.id}`}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                      >
                        Editar
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

