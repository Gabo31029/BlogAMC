import { apiFetch } from './api'
import { getAccessToken } from './auth'

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  updated_at: string | null
  created_at?: string
  content_json?: Record<string, unknown>
  content_html?: string | null
}

export async function listPublishedPosts() {
  return apiFetch<Post[]>('/posts', { method: 'GET' })
}

export async function getPostById(id: string) {
  const token = getAccessToken()
  return apiFetch<Post>(`/posts/${id}`, { method: 'GET', token })
}

export type PostUpsertInput = {
  title: string
  slug?: string | null
  excerpt?: string | null
  cover_image_url?: string | null
  content_json: Record<string, unknown>
  content_html: string
  published: boolean
}

export async function createPost(input: PostUpsertInput): Promise<Post> {
  const token = getAccessToken()
  if (!token) throw new Error('No autenticado')
  return apiFetch<Post>('/posts', { method: 'POST', token, body: input })
}

export async function updatePost(postId: string, input: PostUpsertInput): Promise<Post> {
  const token = getAccessToken()
  if (!token) throw new Error('No autenticado')
  return apiFetch<Post>(`/posts/${postId}`, { method: 'PATCH', token, body: input })
}

export async function deletePost(postId: string): Promise<void> {
  const token = getAccessToken()
  if (!token) throw new Error('No autenticado')
  await apiFetch(`/posts/${postId}`, { method: 'DELETE', token })
}

export async function uploadImageToSupabase(file: File) {
  const token = getAccessToken()
  if (!token) throw new Error('No autenticado')

  const url = new URL((import.meta.env.VITE_API_URL as string) || 'http://localhost:8000')
  url.pathname = '/uploads/image'

  const form = new FormData()
  form.append('file', file)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`Upload falló: ${res.status} ${msg}`)
  }

  return (await res.json()) as { url: string; path?: string }
}

