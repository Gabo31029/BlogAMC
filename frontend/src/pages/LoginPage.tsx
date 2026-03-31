import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { loginAdmin } from '../lib/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen">
      <SiteHeader variant="solid" />
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold tracking-tight">Acceso admin</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Ingresa tu usuario y contraseña.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)

            const form = e.currentTarget
            const formData = new FormData(form)
            const username = String(formData.get('username') ?? '')
            const password = String(formData.get('password') ?? '')

            loginAdmin(username, password)
              .then(() => navigate('/editor/new'))
              .catch((err) => setError(String(err?.message ?? err)))
              .finally(() => setLoading(false))
          }}
        >
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label className="text-sm text-zinc-700">Usuario</label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
              defaultValue="admin"
              name="username"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
              defaultValue="password"
              name="password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
      </div>
    </div>
  )
}

