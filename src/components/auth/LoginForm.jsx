import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import PasswordInput from './PasswordInput'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : 'Failed to log in'
      )
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
        <label htmlFor="login-email" className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-wider">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
        />
      </div>
      <PasswordInput
        id="login-password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Log in'}
      </Button>
      <p className="text-center text-xs text-[var(--color-ink-muted)] pt-2">
        No account yet?{' '}
        <Link to="/signup" className="text-[var(--color-ink)] underline underline-offset-2 decoration-[var(--color-border)] hover:decoration-[var(--color-ink)] transition-colors">Create one</Link>
      </p>
    </form>
  )
}
