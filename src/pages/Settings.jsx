import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Avatar from '../components/ui/Avatar'
import AvatarMenu from '../components/ui/AvatarMenu'
import ColorPicker from '../components/ui/ColorPicker'
import { setUsername, setAvatarColor } from '../lib/users'
import { avatarColorFromUsername } from '../lib/avatar'

const themes = [
  { value: 'system', label: 'System', description: 'Follow your device settings' },
  { value: 'light', label: 'Light', description: 'Always use light mode' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode' },
]

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'account', label: 'Account' },
]

export default function Settings() {
  const { user, userProfile, setUserProfile, loading: authLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const [activeSection, setActiveSection] = useState('profile')
  const [usernameValue, setUsernameValue] = useState('')
  const [avatarColor, setAvatarColorValue] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [hasProfile, setHasProfile] = useState(null)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => { document.title = 'Settings | Meta Collections' }, [])

  useEffect(() => {
    if (userProfile !== undefined) {
      setHasProfile(!!userProfile)
      if (userProfile?.username) {
        setUsernameValue(userProfile.username)
      }
    }
  }, [userProfile])

  const originalUsername = userProfile?.username || ''
  const originalColor = userProfile?.avatarColor || avatarColorFromUsername(userProfile?.username || '')
  const profileChanged = usernameValue.trim() !== originalUsername || avatarColor !== originalColor

  useEffect(() => {
    setAvatarColorValue(originalColor)
  }, [originalColor])

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  if (hasProfile === null) return <LoadingSpinner />

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    const trimmed = usernameValue.trim()
    if (!trimmed) {
      setProfileError('Username is required')
      return
    }
    if (trimmed.length < 3 || trimmed.length > 20) {
      setProfileError('Username must be 3-20 characters')
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setProfileError('Username can only contain letters, numbers, - and _')
      return
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(avatarColor)) {
      setProfileError('Invalid color')
      return
    }

    setSavingProfile(true)
    try {
      if (trimmed !== userProfile?.username) {
        await setUsername(user.uid, trimmed, userProfile?.usernameLower)
      }
      if (avatarColor !== userProfile?.avatarColor) {
        await setAvatarColor(user.uid, avatarColor)
      }
      setUserProfile({ ...userProfile, username: trimmed, usernameLower: trimmed.toLowerCase(), avatarColor })
      setProfileSuccess('Saved')
      setTimeout(() => setProfileSuccess(''), 2000)
    } catch (err) {
      setProfileError(err.message)
    }
    setSavingProfile(false)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            Meta Collections
          </Link>
          <AvatarMenu />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] mb-8">
          Settings
        </h2>

        <div className="flex gap-10">
          <nav className="hidden md:flex flex-col items-stretch w-40 shrink-0">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                  activeSection === s.id
                    ? 'bg-[var(--color-border)]/40 text-[var(--color-ink)] font-medium'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/20'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0">
            <div className="flex md:hidden gap-1 mb-8 border-b border-[var(--color-border)] overflow-x-auto">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`px-3 py-2 text-sm whitespace-nowrap transition-colors cursor-pointer ${
                    activeSection === s.id
                      ? 'border-b-2 border-[var(--color-ink)] text-[var(--color-ink)] font-medium'
                      : 'text-[var(--color-ink-muted)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {activeSection === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <section className="mb-10">
                  <h3 className="text-sm font-medium text-[var(--color-ink)] mb-3">
                    {!hasProfile ? 'Choose a username' : 'Username'}
                  </h3>
                  <div className="flex-1 max-w-xs">
                    <input
                      type="text"
                      value={usernameValue}
                      onChange={(e) => setUsernameValue(e.target.value)}
                      maxLength={20}
                      placeholder="3-20 characters"
                      className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                    />
                  </div>
                </section>

                <section className="mb-10">
                  <h3 className="text-sm font-medium text-[var(--color-ink)] mb-4">Profile picture</h3>
                  <div className="flex items-center gap-6">
                    <Avatar username={usernameValue || userProfile?.username} color={avatarColor} size={64} />
                    <div className="flex-1 min-w-0">
                      <ColorPicker value={avatarColor} onChange={setAvatarColorValue} />
                    </div>
                  </div>
                </section>

                <section className="pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={savingProfile || !profileChanged}>
                      {savingProfile ? 'Saving...' : 'Save changes'}
                    </Button>
                    {profileError && (
                      <span className="text-xs text-[var(--color-danger)]">{profileError}</span>
                    )}
                    {profileSuccess && !profileError && (
                      <span className="text-xs text-green-600">{profileSuccess}</span>
                    )}
                  </div>
                </section>
              </form>
            )}

            {activeSection === 'appearance' && (
              <section>
                <h3 className="text-sm font-medium text-[var(--color-ink)] mb-3">Appearance</h3>
                <div className="inline-flex rounded-lg border border-[var(--color-border)] overflow-hidden">
                  {themes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={`px-4 py-2 text-sm transition-colors cursor-pointer ${
                        theme === t.value
                          ? 'bg-[var(--color-surface-raised)] text-[var(--color-ink)] font-medium'
                          : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/30'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeSection === 'account' && (
              <section>
                <h3 className="text-sm font-medium text-[var(--color-ink)] mb-4">Account</h3>
                <div className="flex flex-col items-stretch gap-2 max-w-xs">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-md">
                    <span className="text-sm text-[var(--color-ink-muted)]">Email</span>
                    <span className="text-sm text-[var(--color-ink)] truncate ml-4">{user.email}</span>
                  </div>
                  <Button onClick={() => setShowLogout(true)} variant="secondary" className="text-[var(--color-danger)] hover:text-[var(--color-danger)] mt-2">
                    Log out
                  </Button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={logout}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        variant="primary"
      />
    </div>
  )
}