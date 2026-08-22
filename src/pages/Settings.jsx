import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import { setUsername } from '../lib/users'

const themes = [
  { value: 'system', label: 'System', description: 'Follow your device settings' },
  { value: 'light', label: 'Light', description: 'Always use light mode' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode' },
]

export default function Settings() {
  const { user, userProfile, setUserProfile, loading: authLoading } = useAuth()
  const { theme, setTheme } = useTheme()

  const [usernameValue, setUsernameValue] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuccess, setUsernameSuccess] = useState('')
  const [savingUsername, setSavingUsername] = useState(false)
  const [hasProfile, setHasProfile] = useState(null)

  useEffect(() => { document.title = 'Settings | Meta Collections' }, [])

  useEffect(() => {
    if (userProfile !== undefined) {
      setHasProfile(!!userProfile)
      if (userProfile?.username) {
        setUsernameValue(userProfile.username)
      }
    }
  }, [userProfile])

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  if (hasProfile === null) return <LoadingSpinner />

  async function handleUsernameSubmit(e) {
    e.preventDefault()
    setUsernameError('')
    setUsernameSuccess('')

    const trimmed = usernameValue.trim()
    if (!trimmed) {
      setUsernameError('Username is required')
      return
    }
    if (trimmed.length < 3 || trimmed.length > 20) {
      setUsernameError('Username must be 3-20 characters')
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUsernameError('Username can only contain letters, numbers, - and _')
      return
    }

    setSavingUsername(true)
    try {
      await setUsername(user.uid, trimmed, userProfile?.usernameLower)
      setUserProfile({ ...userProfile, username: trimmed, usernameLower: trimmed.toLowerCase() })
      setUsernameSuccess('Username saved')
      setTimeout(() => setUsernameSuccess(''), 2000)
    } catch (err) {
      setUsernameError(err.message)
    }
    setSavingUsername(false)
  }

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

        <section className="mb-8">
          <h3 className="text-sm font-medium text-[var(--color-ink)] mb-3">
            {!hasProfile ? 'Choose a username' : 'Username'}
          </h3>
          <form onSubmit={handleUsernameSubmit} className="flex items-start gap-3">
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                value={usernameValue}
                onChange={(e) => setUsernameValue(e.target.value)}
                maxLength={20}
                placeholder="3-20 characters"
                className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
              />
              {usernameError && (
                <p className="text-xs text-[var(--color-danger)] mt-1.5">{usernameError}</p>
              )}
              {usernameSuccess && (
                <p className="text-xs text-green-600 mt-1.5">{usernameSuccess}</p>
              )}
            </div>
            <Button type="submit" disabled={savingUsername}>
              {savingUsername ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </section>

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
