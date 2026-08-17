import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCollections } from '../hooks/useCollections'
import { Navigate } from 'react-router-dom'
import CollectionCard from '../components/dashboard/CollectionCard'
import CreateCollectionModal from '../components/dashboard/CreateCollectionModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const { collections, loading, createCollection, deleteCollection, MAX_COLLECTIONS } = useCollections(user?.uid)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showLogout, setShowLogout] = useState(false)

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCollection(deleteTarget.id)
    } catch {}
    setDeleteTarget(null)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">Meta Collections</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--color-ink-faint)] hidden sm:inline">{user.email}</span>
            <button onClick={() => setShowLogout(true)} className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">Collections</h2>
            <p className="text-xs text-[var(--color-ink-faint)] mt-1">
              {collections.length} / {MAX_COLLECTIONS}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            New
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : collections.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-[var(--color-ink-muted)] mb-6">
              Nothing here yet.
            </p>
            <Button onClick={() => setShowCreate(true)}>Create a collection</Button>
          </div>
        ) : (
          <div className="space-y-px">
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                userId={user.uid}
                onDelete={(id, name) => setDeleteTarget({ id, name })}
              />
            ))}
          </div>
        )}
      </main>

      <CreateCollectionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createCollection}
        maxReached={collections.length >= MAX_COLLECTIONS}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete collection"
        message={`Delete "${deleteTarget?.name}" and all its metas? This can't be undone.`}
      />

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
