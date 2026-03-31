import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { getPostById, type Post } from '../lib/posts'

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getPostById(id)
      .then((p) => setPost(p))
      .catch((e) => setError(String(e?.message ?? e)))
  }, [id])

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <header className="mx-auto max-w-4xl px-6 pt-28 pb-6">
        <p className="text-sm text-zinc-500">Post</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          {post?.title ?? (id ? `Post ${id}` : 'Post')}
        </h1>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-16">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : !post ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            Cargando...
          </div>
        ) : (
          <article className="notion-prose overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="h-56 w-full object-cover"
              />
            ) : null}
            <div className="p-6">
              {post.excerpt ? (
                <p className="text-zinc-600 mb-4">{post.excerpt}</p>
              ) : null}
              <div
                className="notion-prose"
                dangerouslySetInnerHTML={{ __html: post.content_html ?? '' }}
              />
            </div>
          </article>
        )}
      </main>
    </div>
  )
}

