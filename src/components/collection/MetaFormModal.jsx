import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import MapEditor from './MapEditor'

const MAX_EXAMPLES = 3
const MAX_CHARS = 1000
const URL_PATTERN = /^https:\/\/maps\.app\.goo\.gl\/.+/

function MetaForm({ onSubmit, initialText, initialMapData, initialExamples, submitLabel, externalError }) {
  const [text, setText] = useState(initialText || '')
  const [mapData, setMapData] = useState(initialMapData || null)
  const [useMap, setUseMap] = useState(!!initialMapData)
  const [examples, setExamples] = useState(initialExamples || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateExample(index, field, value) {
    const updated = [...examples]
    updated[index] = { ...updated[index], [field]: value }
    setExamples(updated)
  }

  function addExample() {
    if (examples.length >= MAX_EXAMPLES) return
    setExamples([...examples, { title: '', url: '' }])
  }

  function removeExample(index) {
    setExamples(examples.filter((_, i) => i !== index))
  }

  function getValidExamples() {
    return examples
      .filter((e) => e.url.trim())
      .map((e, i) => ({
        title: e.title.trim() || `Example ${i + 1}`,
        url: e.url.trim(),
      }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() && !(useMap && mapData)) return

    const validExamples = getValidExamples()
    for (const ex of validExamples) {
      if (!URL_PATTERN.test(ex.url)) {
        setError('Example links must be from maps.app.goo.gl')
        return
      }
    }

    setLoading(true)
    setError('')
    try {
      await onSubmit({
        text: text.trim(),
        mapData: useMap ? mapData : null,
        examples: validExamples.length > 0 ? validExamples : null,
      })
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const showErr = error || externalError

  return (
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
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="What's the meta?"
            rows={4}
            className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors resize-none leading-relaxed"
          />
          <span className={`absolute bottom-2.5 right-2 pointer-events-none text-[11px] tabular-nums ${text.length > MAX_CHARS * 0.9 ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink-faint)]'}`}>
            {text.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
            Map
          </label>
        </div>
        {useMap ? (
          <div className="space-y-2">
            <MapEditor value={mapData} onChange={setMapData} />
            <button
              type="button"
              onClick={() => { setUseMap(false); setMapData(null) }}
              className="text-xs font-medium text-[var(--color-danger)] hover:text-[var(--color-danger-hover)] cursor-pointer transition-colors"
            >
              Remove map
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setUseMap(true)}
            className="w-full flex items-center justify-center gap-2 py-6 border border-dashed border-[var(--color-border)] rounded-md text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-raised)] transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Add map
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
            Examples
          </label>
          <span className="text-[11px] text-[var(--color-ink-faint)] tabular-nums">
            {examples.length}/{MAX_EXAMPLES}
          </span>
        </div>
        {examples.length > 0 && (
          <div className="space-y-2 mb-3">
            {examples.map((ex, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ex.title}
                  onChange={(e) => updateExample(i, 'title', e.target.value.slice(0, 50))}
                  placeholder={`Example ${i + 1}`}
                  className="w-32 shrink-0 px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                />
                <input
                  type="url"
                  value={ex.url}
                  onChange={(e) => updateExample(i, 'url', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="flex-1 min-w-0 px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeExample(i)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        {examples.length > 0 && examples.length < MAX_EXAMPLES && (
          <button
            type="button"
            onClick={addExample}
            className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          >
            + Add
          </button>
        )}
        {examples.length === 0 && (
          <button
            type="button"
            onClick={addExample}
            className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-[var(--color-border)] rounded-md text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-raised)] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Add Street View link
          </button>
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
  )
}

export default function MetaFormModal({ open, onClose, onSubmit, title, initialText, initialMapData, initialExamples, submitLabel, error: externalError, formKey }) {
  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      <div key={formKey || 'add'}>
        <MetaForm
          onSubmit={onSubmit}
          initialText={initialText}
          initialMapData={initialMapData}
          initialExamples={initialExamples}
          submitLabel={submitLabel}
          externalError={externalError}
        />
      </div>
    </Modal>
  )
}
