type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

const API_URL = import.meta.env.VITE_API_URL as string | undefined

function getApiBaseUrl() {
  return API_URL?.replace(/\/$/, '') || 'http://localhost:8000'
}

export async function apiFetch<T>(
  path: string,
  options?: {
    method?: HttpMethod
    token?: string | null
    body?: unknown
    query?: Record<string, string>
  },
): Promise<T> {
  const method = options?.method ?? 'GET'
  const token = options?.token ?? null
  const query = options?.query ?? {}

  const url = new URL(getApiBaseUrl() + path)
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v)

  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  let body: BodyInit | undefined
  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body,
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`API ${method} ${path} falló: ${res.status} ${msg}`)
  }

  return (await res.json()) as T
}

