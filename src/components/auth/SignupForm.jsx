import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import PasswordInput from './PasswordInput'
import { setUsername } from '../../lib/users'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [username, setUsernameValue] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      return setError('Username is required')
    }
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return setError('Username must be 3-20 characters')
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return setError('Username can only contain letters, numbers, - and _')
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      const cred = await signup(email, password)
      await setUsername(cred.user.uid, trimmedUsername)
      navigate('/dashboard')
    } catch (err) {
      if (err.message === 'Username is already taken') {
        setError('Username is already taken')
      } else {
        setError(
          err.code === 'auth/email-already-in-use'
            ? 'An account with this email already exists'
            : 'Failed to create account'
        )
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="signup-email" className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-wider">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
        />
      </div>
      <div>
        <label htmlFor="signup-username" className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-wider">Username</label>
        <input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsernameValue(e.target.value)}
          required
          maxLength={20}
          placeholder="3-20 characters"
          className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
        />
      </div>
      <PasswordInput
        id="signup-password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordInput
        id="signup-confirm"
        label="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Sign up'}
      </Button>
      <p className="text-center text-xs text-[var(--color-ink-muted)] pt-2">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-ink)] underline underline-offset-2 decoration-[var(--color-border)] hover:decoration-[var(--color-ink)] transition-colors">Log in</Link>
      </p>
    </form>
  )
}
