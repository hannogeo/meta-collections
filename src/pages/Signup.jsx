import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Signup() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to="/dashboard" />

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="mb-8 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Meta Collections</h1>
          <p className="text-xs text-[var(--color-ink-faint)] mt-1">GeoGuessr metas, organized</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
