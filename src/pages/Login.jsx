import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Login() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to="/dashboard" />

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">Meta Collections</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2">GeoGuessr metas, organized</p>
        </div>
        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
