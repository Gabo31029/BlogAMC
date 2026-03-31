import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { listPublishedPosts, type Post } from '../lib/posts'

type HeroSection = {
  id: string
  title: string
  subtitle: string
  ctaPrimary: { label: string; to: string }
  ctaSecondary?: { label: string; to: string }
  bg: { from: string; via?: string; to: string }
}

function Section({
  id,
  children,
  bg,
}: {
  id: string
  children: React.ReactNode
  bg: HeroSection['bg']
}) {
  const gradient = useMemo(() => {
    const via = bg.via ? `, ${bg.via}` : ''
    return `radial-gradient(1200px 800px at 50% 10%, rgba(255,255,255,0.65), rgba(255,255,255,0) 55%),
linear-gradient(180deg, ${bg.from}${via}, ${bg.to})`
  }, [bg.from, bg.to, bg.via])

  return (
    <section
      id={id}
      className="relative min-h-[100svh] snap-start"
      style={{ backgroundImage: gradient }}
    >
      {children}
    </section>
  )
}

function Hero({ s }: { s: HeroSection }) {
  const profile = useMemo(() => {
    const env = import.meta.env as any
    const courseTitle = String(env.VITE_COURSE_TITLE ?? 'Análisis y Modelamiento de Comportamiento').trim()
    const courseCode = String(env.VITE_COURSE_CODE ?? 'SW503-U').trim()
    const name = String(env.VITE_PROFILE_NAME ?? 'Gabriel Chupa Ballesteros').trim()
    const studentCode = String(env.VITE_PROFILE_STUDENT_CODE ?? '20240160G').trim()
    const program = String(env.VITE_PROFILE_PROGRAM ?? 'Tu carrera / programa').trim()
    const university = String(env.VITE_PROFILE_UNIVERSITY ?? 'Tu universidad').trim()
    const email = String(env.VITE_PROFILE_EMAIL ?? 'tu@email.com').trim()
    const professor = String(env.VITE_PROFILE_PROFESSOR ?? '').trim()
    return { courseTitle, courseCode, name, studentCode, program, university, email, professor }
  }, [])

  return (
    <Section id={s.id} bg={s.bg}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6 pt-32 pb-16 min-h-[100svh] flex flex-col">
        <div className="flex-1 grid place-items-center text-center">
          <div className="mx-auto w-full max-w-3xl">
            {s.id === 'intro' ? (
              <div className="-mt-6">
                <div className="text-[11px] font-semibold tracking-[0.38em] text-zinc-600 uppercase">
                  {profile.courseCode}
                </div>
                <div className="mt-2 text-lg sm:text-2xl font-semibold tracking-tight text-zinc-900">
                  {profile.courseTitle}
                </div>

                <div className="mt-6 flex items-center justify-center">
                  <div className="h-px w-24 bg-zinc-200" />
                </div>

                <div className="mt-6 space-y-2 text-sm sm:text-[15px] text-zinc-700">
                  <div className="text-[11px] font-semibold tracking-[0.34em] text-zinc-500 uppercase">
                    Alumno
                  </div>

                  <div className="text-base sm:text-lg font-semibold text-zinc-900">
                    {profile.name}{' '}
                    <span className="text-zinc-500 font-medium">· {profile.studentCode}</span>
                  </div>

                  {profile.professor ? (
                    <div>
                      <span className="font-semibold text-zinc-900">Profesor</span>
                      <span className="text-zinc-400"> · </span>
                      {profile.professor}
                    </div>
                  ) : null}

                  <div>{[profile.program, profile.university].filter(Boolean).join(' — ')}</div>

                  <div className="pt-2">
                    <a
                      className="text-zinc-700 underline underline-offset-4 hover:text-zinc-900"
                      href={`mailto:${profile.email}`}
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="-mt-10">
                <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight text-zinc-900">
                  {s.title}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-zinc-700">{s.subtitle}</p>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={s.ctaPrimary.to}
                className="w-full sm:w-auto rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-zinc-800"
              >
                {s.ctaPrimary.label}
              </Link>
              {s.ctaSecondary ? (
                <Link
                  to={s.ctaSecondary.to}
                  className="w-full sm:w-auto rounded-full bg-white/75 px-8 py-3.5 text-sm font-semibold tracking-wide text-zinc-900 ring-1 ring-black/10 backdrop-blur transition hover:bg-white"
                >
                  {s.ctaSecondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="pt-10 pb-2 text-center">
          <a
            href={`#${s.id}-next`}
            className="inline-flex items-center justify-center text-xs font-medium tracking-[0.2em] text-zinc-700 hover:text-zinc-900"
          >
            DESLIZA
          </a>
        </div>
      </div>

      <div id={`${s.id}-next`} className="absolute bottom-0 left-0 h-1 w-1 opacity-0" />
    </Section>
  )
}

export default function HomePage() {
  const sections: HeroSection[] = useMemo(
    () => [
      {
        id: 'intro',
        title: 'Blog AMC',
        subtitle: 'Publicaciones con un diseño limpio, rápido y moderno.',
        ctaPrimary: { label: 'Ver posts', to: '/posts' },
        ctaSecondary: { label: 'Nuevo post', to: '/editor/new' },
        bg: { from: '#f8fafc', via: '#eef2ff', to: '#ffffff' },
      },
      {
        id: 'focus',
        title: 'Lectura sin distracciones',
        subtitle: 'Tipografía cuidada, imágenes a pantalla completa y navegación clara.',
        ctaPrimary: { label: 'Explorar', to: '/posts' },
        ctaSecondary: { label: 'Entrar admin', to: '/login' },
        bg: { from: '#ffffff', via: '#f4f4f5', to: '#f8fafc' },
      },
      {
        id: 'latest',
        title: 'Últimos posts',
        subtitle: 'Lo más reciente, listo para leer.',
        ctaPrimary: { label: 'Ir a la galería', to: '/posts' },
        bg: { from: '#ffffff', via: '#f3f4f6', to: '#ffffff' },
      },
    ],
    [],
  )

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
    <div className="min-h-screen bg-white text-zinc-900">
      <SiteHeader variant="overlay" />

      <main className="snap-y snap-mandatory h-[100svh] overflow-y-auto scroll-smooth">
        {sections.slice(0, 2).map((s) => (
          <Hero key={s.id} s={s} />
        ))}

        <Section id="latest" bg={sections[2].bg}>
          <div className="mx-auto max-w-6xl px-6 pt-28 pb-14 min-h-[100svh] flex flex-col">
            <div className="text-center">
              <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-zinc-900">
                {sections[2].title}
              </h2>
              <p className="mt-3 text-base sm:text-lg text-zinc-700">{sections[2].subtitle}</p>
              <div className="mt-7 flex items-center justify-center gap-3">
                <Link
                  to={sections[2].ctaPrimary.to}
                  className="rounded-full bg-zinc-900 px-7 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-zinc-800"
                >
                  {sections[2].ctaPrimary.label}
                </Link>
              </div>
            </div>

            <div className="mt-10 flex-1">
              {error ? (
                <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : posts === null ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-2xl bg-white/70 ring-1 ring-black/10 backdrop-blur"
                    >
                      <div className="h-36 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200" />
                      <div className="p-4">
                        <div className="h-5 w-4/5 rounded bg-zinc-100 animate-pulse" />
                        <div className="mt-3 h-3 w-full rounded bg-zinc-100 animate-pulse" />
                        <div className="mt-2 h-3 w-11/12 rounded bg-zinc-100 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="mx-auto max-w-xl rounded-2xl bg-white/70 px-5 py-10 text-center text-sm text-zinc-700 ring-1 ring-black/10 backdrop-blur">
                  No hay posts publicados todavía.
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.slice(0, 6).map((p) => (
                    <article
                      key={p.id}
                      className="group overflow-hidden rounded-2xl bg-white/70 ring-1 ring-black/10 backdrop-blur transition hover:bg-white"
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
                        <h3 className="text-base font-semibold tracking-tight text-zinc-900">
                          <Link to={`/post/${p.id}`} className="hover:underline">
                            {p.title}
                          </Link>
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm text-zinc-700">
                          {p.excerpt ?? '—'}
                        </p>
                        <div className="mt-4">
                          <Link
                            to={`/post/${p.id}`}
                            className="text-sm font-semibold text-zinc-900 hover:underline"
                          >
                            Leer
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <footer className="pt-10 text-center text-xs text-zinc-600">
              <p>© {new Date().getFullYear()} Blog AMC</p>
            </footer>
          </div>
        </Section>
      </main>
    </div>
  )
}

