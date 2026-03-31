import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import debounce from 'lodash.debounce'
import NotionEditor from '../components/NotionEditor'
import SiteHeader from '../components/SiteHeader'
import { createPost, deletePost, getPostById, updatePost } from '../lib/posts'
import { isAuthenticated } from '../lib/auth'

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [published, setPublished] = useState(false)
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(null)
  const [contentHtml, setContentHtml] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  const postId = id ?? null
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
  }, [navigate])

  useEffect(() => {
    if (!postId) return
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    getPostById(postId)
      .then((p) => {
        setTitle(p.title ?? '')
        setPublished(!!p.published_at)
        setContentJson((p.content_json as Record<string, unknown>) ?? null)
        setContentHtml(p.content_html ?? '')
        setCoverImageUrl(p.cover_image_url ?? null)
      })
      .catch((e) => {
        // Si no existe o no tienes permisos, salimos al gallery.
        navigate('/posts')
        console.error(e)
      })
  }, [navigate, postId])

  const excerpt = useMemo(() => {
    if (!contentHtml) return null
    const tmp = document.createElement('div')
    tmp.innerHTML = contentHtml
    const text = (tmp.textContent ?? '').trim()
    return text ? text.slice(0, 180) : null
  }, [contentHtml])

  const deriveCoverFromHtml = useCallback((html: string): string | null => {
    const match = html.match(/<img[^>]*src="([^"]+)"[^>]*>/i)
    return match?.[1] ?? null
  }, [])

  const handleEditorChange = useCallback(
    (next: { json: Record<string, unknown>; html: string }) => {
      setContentJson(next.json)
      setContentHtml(next.html)
      const nextCover = deriveCoverFromHtml(next.html)
      setCoverImageUrl(nextCover)
    },
    [deriveCoverFromHtml],
  )

  const save = useCallback(
    async (args: { id: string | null; title: string; json: Record<string, unknown>; html: string }) => {
      try {
        setSaveError(null)
        setSaveState('saving')

        const payload = {
          title: args.title,
          content_json: args.json,
          content_html: args.html,
          excerpt,
          cover_image_url: coverImageUrl,
          published,
        }

        if (!args.id) {
          const created = await createPost(payload as any)
          setSaveState('saved')
          if (created?.id) navigate(`/editor/${created.id}`)
          return
        }

        await updatePost(args.id, payload as any)
        setSaveState('saved')
      } catch (e: any) {
        setSaveState('error')
        setSaveError(String(e?.message ?? e))
      }
    },
    [coverImageUrl, excerpt, navigate, published],
  )

  const debouncedSave = useMemo(() => debounce(save, 900), [save])

  useEffect(() => {
    if (!contentJson) return
    if (!title.trim()) return
    if (uploading) return

    debouncedSave({ id: postId, title, json: contentJson, html: contentHtml })
    return () => {
      debouncedSave.cancel()
    }
  }, [contentHtml, contentJson, debouncedSave, postId, title, uploading])

  const onTogglePublish = useCallback(async () => {
    if (!contentJson || !title.trim()) return

    try {
      setSaveError(null)
      setSaveState('saving')

      if (!postId) {
        const created = await createPost({
          title,
          content_json: contentJson,
          content_html: contentHtml,
          excerpt,
          cover_image_url: coverImageUrl,
          published: !published,
        } as any)
        setPublished(!published)
        navigate(`/editor/${created.id}`)
        setSaveState('saved')
        return
      }

      await updatePost(postId, {
        title,
        content_json: contentJson,
        content_html: contentHtml,
        excerpt,
        cover_image_url: coverImageUrl,
        published: !published,
      } as any)

      setPublished((v) => !v)
      setSaveState('saved')
    } catch (e: any) {
      setSaveState('error')
      setSaveError(String(e?.message ?? e))
    }
  }, [contentHtml, contentJson, coverImageUrl, excerpt, navigate, postId, published, title])

  const onDelete = useCallback(async () => {
    if (!postId) return
    const ok = confirm('¿Eliminar este post? Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      await deletePost(postId)
      navigate('/posts')
    } catch (e: any) {
      setSaveError(String(e?.message ?? e))
    }
  }, [deletePost, navigate, postId])

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <header className="mx-auto max-w-6xl px-6 pt-28 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <button
              onClick={() => navigate('/posts')}
              className="mb-3 text-sm text-zinc-600 hover:text-zinc-900"
            >
              ← Volver
            </button>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del post..."
              className="w-full bg-transparent text-5xl font-bold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {uploading ? 'Subiendo imagen...' : saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Guardado' : saveState === 'error' ? 'Error al guardar' : 'Listo'}
              </span>
              {published ? (
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-white">Publicado</span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                  Borrador
                </span>
              )}
            </div>
            {saveError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            ) : null}
          </div>

          <div className="hidden sm:flex flex-col items-end gap-2">
            <button
              onClick={onTogglePublish}
              className="w-40 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
              disabled={!contentJson || !title.trim() || uploading}
            >
              {published ? 'Actualizar' : 'Publicar'}
            </button>
            <button
              onClick={onDelete}
              className="w-40 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              disabled={!postId}
            >
              Eliminar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <NotionEditor
              valueJson={contentJson}
              onUploadingChange={setUploading}
              onChange={handleEditorChange}
              placeholder="Empieza a escribir..."
            />
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Vista previa</p>
            </div>
            <div className="mt-3 notion-prose overflow-auto rounded-xl border border-zinc-100 bg-zinc-50 p-4 h-[540px] text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
              {contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Empieza a escribir para ver la vista previa.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

