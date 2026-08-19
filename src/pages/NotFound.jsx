import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  useEffect(() => { document.title = 'Page not found | Meta Collections' }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-semibold tracking-tighter text-[var(--color-ink-faint)] mb-2">404</p>
        <p className="text-sm text-[var(--color-ink-muted)] mb-8">Page not found</p>
        <Link to="/">
          <Button variant="secondary">Back home</Button>
        </Link>
      </div>
    </div>
  )
}
