import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCollections } from '../hooks/useCollections'
import { Navigate, Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function daysRemaining(deletedAt) {
  if (!deletedAt?.toDate) return 7
  const deleted = deletedAt.toDate()
  const expiry = new Date(deleted.getTime() + 7 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function Trash() {
  const { user, loading: authLoading } = useAuth()
  const { trashCollections, restoreCollection, permanentDeleteCollection, emptyTrash } = useCollections(user?.uid)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showEmptyTrash, setShowEmptyTrash] = useState(false)

  useEffect(() => { document.title = 'Trash | Meta Collections' }, [])

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />

  async function handlePermanentDelete() {
    if (!deleteTarget) return
    await permanentDeleteCollection(deleteTarget.id)
    setDeleteTarget(null)
  }

  async function handleEmptyTrash() {
    await emptyTrash()
    setShowEmptyTrash(false)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link to="/dashboard" className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            &larr; All
          </Link>
          <h1 className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">Trash</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {trashCollections.length === 0 ? (
          <div className="py-20">
            <div className="max-w-sm mx-auto text-center">
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Trash is empty. Deleted collections appear here and are permanently removed after 7 days.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-[var(--color-ink-faint)] mb-8">
              Deleted collections are kept for 7 days, then permanently removed.
            </p>

            <div className="space-y-3 mb-8">
              {trashCollections.map((col) => (
                <div key={col.id} className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[var(--color-ink-muted)] truncate line-through">
                      {col.emoji && <span className="mr-1.5">{col.emoji}</span>}
                      {col.name}
                    </h3>
                    <p className="text-xs text-[var(--color-ink-faint)] mt-1 tabular-nums">
                      {col.metaCount || 0} metas &middot; {daysRemaining(col.deletedAt)}d left
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <button
                      onClick={() => restoreCollection(col.id)}
                      className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => setDeleteTarget(col)}
                      className="text-xs text-[var(--color-danger)] hover:text-[var(--color-danger-hover)] transition-colors cursor-pointer"
                    >
                      Delete now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="danger" onClick={() => setShowEmptyTrash(true)}>
              Empty trash
            </Button>
          </>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently delete?"
        message={`"${deleteTarget?.name}" and all its metas will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete permanently"
      />

      <ConfirmDialog
        open={showEmptyTrash}
        onClose={() => setShowEmptyTrash(false)}
        onConfirm={handleEmptyTrash}
        title="Empty trash?"
        message={`Permanently delete all ${trashCollections.length} items? This can't be undone.`}
        confirmLabel="Empty trash"
      />
    </div>
  )
}
