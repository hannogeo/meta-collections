import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCollections, resolveCollectionPath, loadPublicMetas } from '../hooks/useCollections'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import MetaCard from '../components/collection/MetaCard'
import MetaFormModal from '../components/collection/MetaFormModal'
import EmojiPicker from '../components/dashboard/EmojiPicker'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Collection() {
  const { username, collectionName } = useParams()
  const { user, loading: authLoading } = useAuth()
  const { getMetas, addMeta, updateMeta, deleteMeta, updateEmoji, renameCollection, collections: ownerCollections, loading: collectionsLoading, loaded: collectionsLoaded, MAX_METAS } = useCollections(user?.uid)

  const [metas, setMetas] = useState([])
  const [metasLoading, setMetasLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingMeta, setEditingMeta] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [renameEmoji, setRenameEmoji] = useState('')
  const [renameVisibility, setRenameVisibility] = useState('private')
  const [renameError, setRenameError] = useState('')
  const [publicCollection, setPublicCollection] = useState(null)
  const navigate = useNavigate()
  const bottomRef = useRef(null)
  const publicLoadAttempted = useRef(false)

  const ownerMatch = ownerCollections?.find(
    (c) => c.name.toLowerCase() === collectionName?.toLowerCase()
  )
  const collection = ownerMatch || publicCollection

  const isViewOnly = !user || (user && !collection)

  useEffect(() => {
    if (collection?.name) {
      document.title = `${collection.name} | Meta Collections`
    }
    return () => { document.title = 'Meta Collections' }
  }, [collection?.name])

  useEffect(() => {
    if (authLoading) return

    if (user && collectionsLoaded) {
      const found = ownerCollections.find(
        (c) => c.name.toLowerCase() === collectionName?.toLowerCase()
      )

      if (found) {
        let cancelled = false
        async function load() {
          try {
            const data = await getMetas(found.id)
            if (!cancelled) setMetas(data)
          } catch {
            if (!cancelled) setNotFound(true)
          }
          if (!cancelled) setMetasLoading(false)
        }
        load()
        return () => { cancelled = true }
      }

      if (!publicLoadAttempted.current) {
        publicLoadAttempted.current = true
        loadPublic()
        return
      }
    }

    if (!user && !authLoading && !publicLoadAttempted.current) {
      publicLoadAttempted.current = true
      loadPublic()
    }
  }, [user, authLoading, collectionsLoaded, ownerCollections, collectionName])

  async function loadPublic() {
    try {
      const result = await resolveCollectionPath(username, collectionName)
      if (!result || result.visibility !== 'public') {
        setNotFound(true)
        setMetasLoading(false)
        return
      }
      setPublicCollection(result)
      const data = await loadPublicMetas(result.uid, result.collectionId)
      setMetas(data)
      setMetasLoading(false)
    } catch {
      setNotFound(true)
      setMetasLoading(false)
    }
  }

  if (authLoading) return <LoadingSpinner />
  if (notFound) return <Navigate to="/404" />
  if (metasLoading) return <LoadingSpinner />
  if (!collection) return <Navigate to="/404" />

  const collectionId = collection.collectionId || collection.id
  const ownerId = collection.uid

  async function handleAdd(data) {
    await addMeta(collectionId, data)
    const updated = await getMetas(collectionId)
    setMetas(updated)
    setShowAdd(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100)
  }

  async function handleEdit(data) {
    await updateMeta(collectionId, editingMeta.id, data)
    setEditingMeta(null)
    const updated = await getMetas(collectionId)
    setMetas(updated)
  }

  async function handleDelete(metaId) {
    await deleteMeta(collectionId, metaId)
    const updated = await getMetas(collectionId)
    setMetas(updated)
  }

  function openRename() {
    setRenameValue(collection.name)
    setRenameEmoji(collection.emoji || '')
    setRenameVisibility(collection.visibility || 'private')
    setRenameError('')
    setShowRename(true)
  }

  async function handleRenameSubmit(e) {
    e.preventDefault()
    if (!renameValue.trim()) return
    try {
      await renameCollection(collectionId, renameValue.trim(), renameEmoji, renameVisibility)
      setShowRename(false)
      navigate(`/${username}/${renameValue.trim()}`, { replace: true })
    } catch (err) {
      setRenameError(err.message)
    }
  }

  const canEdit = user && !!ownerMatch

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4 group">
          <button
            onClick={() => user ? navigate('/dashboard') : navigate('/')}
            className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          >
            &larr; {user ? 'All' : 'Home'}
          </button>
          {canEdit && (
            <EmojiPicker
              value={collection.emoji || ''}
              onChange={(emoji) => updateEmoji(collectionId, emoji)}
            >
              <div className="group/emoji relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-border)]/50 transition-colors text-lg shrink-0 cursor-pointer" title="Change icon">
                {collection.emoji || (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--color-ink-faint)]">
                    <circle cx="10" cy="10" r="8" strokeDasharray="3 3"/>
                  </svg>
                )}
                {collection.emoji && (
                  <span
                    onClick={(e) => { e.stopPropagation(); updateEmoji(collectionId, '') }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 flex items-center justify-center cursor-pointer text-[10px] leading-none transition-all opacity-0 group-hover/emoji:opacity-100 pointer-events-none group-hover/emoji:pointer-events-auto"
                    title="Remove icon"
                  >
                    &times;
                  </span>
                )}
              </div>
            </EmojiPicker>
          )}
          {collection.emoji && !canEdit && (
            <span className="text-lg shrink-0">{collection.emoji}</span>
          )}
          <button
            onClick={canEdit ? openRename : undefined}
            className={`text-sm font-semibold tracking-tight text-[var(--color-ink)] truncate flex-1 text-left ${canEdit ? 'hover:underline underline-offset-2 decoration-[var(--color-border)] hover:decoration-[var(--color-ink)] transition-colors cursor-pointer' : ''}`}
          >
            {collection.name}
          </button>
          {collection.visibility === 'public' && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-ink-faint)] shrink-0">
              Public
            </span>
          )}
          {collection.visibility === 'private' && canEdit && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-ink-faint)] shrink-0">
              Private
            </span>
          )}
          <span className="text-xs tabular-nums text-[var(--color-ink-faint)] shrink-0">
            {metas.length}/{MAX_METAS}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {canEdit && (
          <div className="flex justify-center mb-10">
            <Button onClick={() => setShowAdd(true)}>
              Add meta
            </Button>
          </div>
        )}

        {!user && (
          <div className="mb-8 px-4 py-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg flex items-center justify-between">
            <p className="text-sm text-[var(--color-ink-muted)]">
              This is a public collection.
            </p>
            <a href="/login" className="text-sm text-[var(--color-ink)] font-medium hover:underline underline-offset-2 decoration-[var(--color-border)] hover:decoration-[var(--color-ink)] transition-colors">
              Log in
            </a>
          </div>
        )}
        {user && !canEdit && (
          <div className="mb-8 px-4 py-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg">
            <p className="text-sm text-[var(--color-ink-muted)]">
              This is a public collection by <span className="text-[var(--color-ink)] font-medium">{username}</span>. Read-only.
            </p>
          </div>
        )}

        {metas.length === 0 ? (
          <div className="py-20">
            <div className="max-w-sm mx-auto text-center">
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {canEdit ? 'No metas yet. Add your first tip, trick, or location marker above.' : 'No metas in this collection yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {metas.map((meta, i) => (
              <MetaCard
                key={meta.id}
                meta={meta}
                index={i + 1}
                onEdit={canEdit ? (m) => setEditingMeta(m) : null}
                onDelete={canEdit ? handleDelete : null}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {canEdit && (
        <>
          <MetaFormModal
            open={showAdd}
            onClose={() => setShowAdd(false)}
            onSubmit={handleAdd}
            title="Add meta"
            submitLabel="Add"
            metaCount={metas.length}
            maxMetas={MAX_METAS}
          />

          <MetaFormModal
            open={!!editingMeta}
            onClose={() => setEditingMeta(null)}
            onSubmit={handleEdit}
            title="Edit meta"
            submitLabel="Save"
            initialText={editingMeta?.text}
            initialMapData={editingMeta?.mapData}
            initialExamples={editingMeta?.examples}
            formKey={editingMeta?.id}
          />

          <Modal open={showRename} onClose={() => setShowRename(false)} title="Edit collection">
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              {renameError && (
                <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 px-3 py-2 rounded-md">
                  {renameError}
                </div>
              )}
              <EmojiPicker value={renameEmoji} onChange={setRenameEmoji} />
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
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
                    onClick={() => setRenameVisibility('private')}
                    className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors cursor-pointer ${
                      renameVisibility === 'private'
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
                    onClick={() => setRenameVisibility('public')}
                    className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors cursor-pointer ${
                      renameVisibility === 'public'
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
              </div>
              <Button
                type="submit"
                disabled={!renameValue.trim() || (renameValue.trim() === collection.name && renameEmoji === (collection.emoji || '') && renameVisibility === (collection.visibility || 'private'))}
                className="w-full"
              >
                Save
              </Button>
            </form>
          </Modal>
        </>
      )}
    </div>
  )
}
