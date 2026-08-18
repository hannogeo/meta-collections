import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCollections } from '../hooks/useCollections'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import MetaCard from '../components/collection/MetaCard'
import MetaFormModal from '../components/collection/MetaFormModal'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Collection() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const { getMetas, addMeta, updateMeta, deleteMeta, collections, MAX_METAS } = useCollections(user?.uid)
  const [metas, setMetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingMeta, setEditingMeta] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const navigate = useNavigate()

  const collection = collections.find((c) => c.id === id)

  useEffect(() => {
    if (!user || !id) return

    let cancelled = false

    async function load() {
      try {
        const data = await getMetas(id)
        if (!cancelled) setMetas(data)
      } catch {
        if (!cancelled) setNotFound(true)
      }
      if (!cancelled) setLoading(false)
    }

    if (collections.length > 0 && !collection) {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (collections.length > 0) {
      load()
    }
  }, [user, id, collections])

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  if (notFound) return <Navigate to="/404" />
  if (loading || collections.length === 0) return <LoadingSpinner />

  async function handleAdd(data) {
    await addMeta(id, data)
    const updated = await getMetas(id)
    setMetas(updated)
  }

  async function handleEdit(data) {
    await updateMeta(id, editingMeta.id, data)
    setEditingMeta(null)
    const updated = await getMetas(id)
    setMetas(updated)
  }

  async function handleDelete(metaId) {
    await deleteMeta(id, metaId)
    const updated = await getMetas(id)
    setMetas(updated)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          >
            &larr; All
          </button>
          <h1 className="text-sm font-semibold tracking-tight text-[var(--color-ink)] truncate flex-1">
            {collection?.name || 'Collection'}
          </h1>
          <span className="text-xs tabular-nums text-[var(--color-ink-faint)] shrink-0">
            {metas.length}/{MAX_METAS}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex justify-center mb-10">
          <Button onClick={() => setShowAdd(true)}>
            Add meta
          </Button>
        </div>

        {metas.length === 0 ? (
          <div className="py-20">
            <div className="max-w-sm mx-auto text-center">
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                No metas yet. Add your first tip, trick, or location marker above.
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
                onEdit={(m) => setEditingMeta(m)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

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
        formKey={editingMeta?.id}
      />
    </div>
  )
}
