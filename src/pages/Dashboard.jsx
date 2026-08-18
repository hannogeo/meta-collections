import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCollections } from '../hooks/useCollections'
import { Navigate, Link } from 'react-router-dom'
import CollectionCard from '../components/dashboard/CollectionCard'
import CreateCollectionModal from '../components/dashboard/CreateCollectionModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const { collections, loading, createCollection, renameCollection, softDeleteCollection, MAX_COLLECTIONS } = useCollections(user?.uid)
  const [showCreate, setShowCreate] = useState(false)
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showLogout, setShowLogout] = useState(false)

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />

  function handleRename(col) {
    setRenameTarget(col)
    setRenameValue(col.name)
  }

  async function handleRenameSubmit(e) {
    e.preventDefault()
    if (!renameValue.trim() || !renameTarget) return
    await renameCollection(renameTarget.id, renameValue.trim())
    setRenameTarget(null)
    setRenameValue('')
  }

  async function handleSoftDelete() {
    if (!deleteTarget) return
    await softDeleteCollection(deleteTarget.id)
    setDeleteTarget(null)
  }

  const totalMetas = collections.reduce((sum, c) => sum + (c.metaCount || 0), 0)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            Meta Collections
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/trash" className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] transition-colors hidden sm:inline">
              Trash
            </Link>
            <span className="text-xs text-[var(--color-ink-faint)] hidden sm:inline">{user.email}</span>
            <button onClick={() => setShowLogout(true)} className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {collections.length === 0 ? 'Welcome' : 'Your collections'}
          </h2>
          {collections.length > 0 && (
            <p className="text-sm text-[var(--color-ink-faint)] mt-1">
              {collections.length} {collections.length === 1 ? 'collection' : 'collections'} &middot; {totalMetas} {totalMetas === 1 ? 'meta' : 'metas'} total
            </p>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : collections.length === 0 ? (
          <div className="py-20">
            <div className="max-w-md">
              <h3 className="text-base font-medium text-[var(--color-ink)] mb-2">Start collecting metas</h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-6">
                Create a collection to organize your GeoGuessr tips, tricks, and location markers.
              </p>
              <Button onClick={() => setShowCreate(true)}>Create your first collection</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                onRename={handleRename}
                onDelete={(col) => setDeleteTarget(col)}
              />
            ))}
            {collections.length < MAX_COLLECTIONS && (
              <button
                onClick={() => setShowCreate(true)}
                className="border border-dashed border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] transition-colors cursor-pointer min-h-[100px]"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="10" y1="4" x2="10" y2="16"/>
                  <line x1="4" y1="10" x2="16" y2="10"/>
                </svg>
                <span className="text-xs font-medium">New collection</span>
              </button>
            )}
          </div>
        )}
      </main>

      <CreateCollectionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createCollection}
        maxReached={collections.length >= MAX_COLLECTIONS}
      />

      <Modal open={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rename collection">
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          />
          <Button type="submit" disabled={!renameValue.trim() || renameValue.trim() === renameTarget?.name} className="w-full">
            Rename
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleSoftDelete}
        title="Move to trash?"
        message={`"${deleteTarget?.name}" will be moved to trash. You can restore it within 7 days.`}
        confirmLabel="Move to trash"
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
