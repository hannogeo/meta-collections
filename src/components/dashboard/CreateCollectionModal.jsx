import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import EmojiPicker from './EmojiPicker'

export default function CreateCollectionModal({ open, onClose, onCreate, maxReached }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      await onCreate(name.trim(), emoji)
      setName('')
      setEmoji('')
      onClose()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  function handleClose() {
    setName('')
    setEmoji('')
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="New collection">
      {maxReached ? (
        <div>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-4">
            You've hit the 5 collection limit. Delete one first.
          </p>
          <Button variant="secondary" onClick={handleClose} className="w-full">Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          <div className="flex items-end gap-3">
            <EmojiPicker value={emoji} onChange={setEmoji}>
              <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors cursor-pointer shrink-0">
                {emoji ? (
                  <span className="text-2xl">{emoji}</span>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--color-ink-faint)]">
                    <circle cx="10" cy="10" r="8" strokeDasharray="3 3"/>
                  </svg>
                )}
              </div>
            </EmojiPicker>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Scandinavian metas"
                autoFocus
                className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading || !name.trim()} className="w-full">
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
