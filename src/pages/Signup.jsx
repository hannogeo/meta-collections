import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Logo from '../components/ui/Logo'
import { usePageMeta } from '../lib/seo'

export default function Signup() {
  const { user, loading } = useAuth()

  usePageMeta({
    title: 'Sign up | Meta Collections',
    description: 'Create a free Meta Collections account and start organizing your GeoGuessr metas.',
  })

  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to="/dashboard" />

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo size={36} />
          <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-[var(--color-ink)]">Meta Collections</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1.5">GeoGuessr metas, organized</p>
        </div>
        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl p-6">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
