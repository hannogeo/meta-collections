import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCollections } from '../hooks/useCollections'
import { Navigate, Link } from 'react-router-dom'
import CollectionCard from '../components/dashboard/CollectionCard'
import CreateCollectionModal from '../components/dashboard/CreateCollectionModal'
import EmojiPicker from '../components/dashboard/EmojiPicker'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Dashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { collections, loading, createCollection, renameCollection, updateEmoji, softDeleteCollection, MAX_COLLECTIONS } = useCollections(user?.uid)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editVisibility, setEditVisibility] = useState('private')
  const [editError, setEditError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { document.title = 'Dashboard | Meta Collections' }, [])

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />

  function handleEdit(col) {
    setEditTarget(col)
    setEditValue(col.name)
    setEditEmoji(col.emoji || '')
    setEditVisibility(col.visibility || 'private')
    setEditError('')
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    if (!editValue.trim() || !editTarget) return
    try {
      await renameCollection(editTarget.id, editValue.trim(), editEmoji, editVisibility)
      setEditTarget(null)
      setEditValue('')
      setEditEmoji('')
      setEditVisibility('private')
      setEditError('')
    } catch (err) {
      setEditError(err.message)
    }
  }

  async function handleSoftDelete() {
    if (!deleteTarget) return
    await softDeleteCollection(deleteTarget.id)
    setDeleteTarget(null)
  }

  const totalMetas = collections.reduce((sum, c) => sum + (c.metaCount || 0), 0)

  const editDisabled = !editValue.trim() || (
    editValue.trim() === editTarget?.name &&
    editEmoji === (editTarget?.emoji || '') &&
    editVisibility === (editTarget?.visibility || 'private')
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            Meta Collections
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors" title="Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {collections.length === 0 ? 'Welcome' : 'Your collections'}
          </h2>
          {collections.length > 0 && (
            <p className="text-sm text-[var(--color-ink-faint)] mt-1 flex items-center gap-2">
              <span>{collections.length} {collections.length === 1 ? 'collection' : 'collections'} &middot; {totalMetas} {totalMetas === 1 ? 'meta' : 'metas'} total</span>
              <Link to="/trash" className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-[var(--color-border)]/40 transition-colors" title="Trash">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </Link>
            </p>
          )}
        </div>

        {loading ? (
          <LoadingSpinner fullPage={false} />
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
                username={userProfile?.username}
                onEdit={handleEdit}
                onDelete={(col) => setDeleteTarget(col)}
                onUpdateEmoji={updateEmoji}
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

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit collection">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 px-3 py-2 rounded-md">
              {editError}
            </div>
          )}
          <EmojiPicker value={editEmoji} onChange={setEditEmoji} />
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          />
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-2 uppercase tracking-wider">
              Visibility
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditVisibility('private')}
                className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors cursor-pointer ${
                  editVisibility === 'private'
                    ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-surface)]'
                    : 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-hover)]'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Private
                </span>
              </button>
              <button
                type="button"
                onClick={() => setEditVisibility('public')}
                className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors cursor-pointer ${
                  editVisibility === 'public'
                    ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-surface)]'
                    : 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-hover)]'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  Public
                </span>
              </button>
            </div>
            <p className="text-xs text-[var(--color-ink-faint)] mt-1.5">
              {editVisibility === 'private'
                ? 'Only you can see this collection.'
                : 'Anyone with the link can view this collection.'}
            </p>
          </div>
          <Button type="submit" disabled={editDisabled} className="w-full">
            Save
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
    </div>
  )
}
