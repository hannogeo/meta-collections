import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import MapEditor from './MapEditor'

export default function MetaFormModal({ open, onClose, onSubmit, title, initialText, initialMapData, submitLabel, error: externalError }) {
  const [text, setText] = useState('')
  const [mapData, setMapData] = useState(null)
  const [useMap, setUseMap] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setText(initialText || '')
      setMapData(initialMapData || null)
      setUseMap(!!initialMapData)
      setError('')
    }
  }, [open, initialText, initialMapData])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() && !(useMap && mapData)) return

    setLoading(true)
    setError('')
    try {
      await onSubmit({
        text: text.trim(),
        mapData: useMap ? mapData : null,
      })
      onClose()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  function handleClose() {
    setError('')
    onClose()
  }

  const showErr = error || externalError

  return (
    <Modal open={open} onClose={handleClose} title={title} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {showErr && (
          <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 px-3 py-2 rounded-md">
            {showErr}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's the meta?"
            rows={4}
            className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors resize-none leading-relaxed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
              Map
            </label>
            <button
              type="button"
              onClick={() => setUseMap(!useMap)}
              className={`text-xs cursor-pointer transition-colors ${
                useMap
                  ? 'text-[var(--color-danger)] hover:text-[var(--color-danger-hover)]'
                  : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]'
              }`}
            >
              {useMap ? 'Remove' : 'Add map'}
            </button>
          </div>
          {useMap && (
            <MapEditor value={mapData} onChange={setMapData} />
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || (!text.trim() && !(useMap && mapData))}
          className="w-full"
        >
          {loading ? 'Saving...' : submitLabel || 'Save'}
        </Button>
      </form>
    </Modal>
  )
}
