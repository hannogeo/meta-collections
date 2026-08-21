import { useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const themes = [
  { value: 'system', label: 'System', description: 'Follow your device settings' },
  { value: 'light', label: 'Light', description: 'Always use light mode' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode' },
]

export default function Settings() {
  const { user, loading: authLoading } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => { document.title = 'Settings | Meta Collections' }, [])

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            Meta Collections
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] mb-8">
          Settings
        </h2>

        <section>
          <h3 className="text-sm font-medium text-[var(--color-ink)] mb-3">Appearance</h3>
          <div className="space-y-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                  theme === t.value
                    ? 'border-[var(--color-ink)] bg-[var(--color-surface-raised)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-[var(--color-ink)]">{t.label}</span>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{t.description}</p>
                  </div>
                  {theme === t.value && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink)] shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
