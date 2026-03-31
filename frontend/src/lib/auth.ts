import { apiFetch } from './api'

const TOKEN_KEY = 'blog_access_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)
}

export function isAuthenticated() {
  return !!getAccessToken()
}

export type LoginResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  user?: { id?: string; email?: string }
}

export async function loginAdmin(username: string, password: string) {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  })

  setAccessToken(data.access_token)
  return data
}

