import { Link, NavLink, useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'

type Props = {
  variant?: 'overlay' | 'solid'
}

export default function SiteHeader({ variant = 'overlay' }: Props) {
  const navigate = useNavigate()

  const base =
    variant === 'solid'
      ? 'bg-white/80 backdrop-blur border-b border-zinc-200'
      : 'bg-transparent'

  return (
    <header className={`fixed inset-x-0 top-0 z-50 ${base}`}>
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-sm font-semibold tracking-[0.28em] text-zinc-900"
            aria-label="Ir al inicio"
          >
            BLOG
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition ${isActive ? 'text-zinc-900' : 'text-zinc-700 hover:text-zinc-900'}`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/posts"
              className={({ isActive }) =>
                `transition ${isActive ? 'text-zinc-900' : 'text-zinc-700 hover:text-zinc-900'}`
              }
            >
              Posts
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(isAuthenticated() ? '/editor/new' : '/login')}
              className={
                variant === 'solid'
                  ? 'rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold tracking-wide text-white transition hover:bg-zinc-800'
                  : 'rounded-full bg-white/85 px-4 py-2 text-xs font-semibold tracking-wide text-zinc-900 shadow-sm ring-1 ring-black/10 backdrop-blur transition hover:bg-white'
              }
            >
              Nuevo post
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

