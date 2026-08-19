import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import MapEditor from './MapEditor'

const MAX_EXAMPLES = 3
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

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
            Examples
          </label>
          {examples.length < MAX_EXAMPLES && (
            <button
              type="button"
              onClick={addExample}
              className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
            >
              + Add
            </button>
          )}
        </div>
        {examples.length > 0 && (
          <div className="space-y-2">
            {examples.map((ex, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ex.title}
                  onChange={(e) => updateExample(i, 'title', e.target.value.slice(0, 50))}
                  placeholder={`Example ${i + 1}`}
                  className="w-28 shrink-0 px-2.5 py-1.5 text-xs bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                />
                <input
                  type="url"
                  value={ex.url}
                  onChange={(e) => updateExample(i, 'url', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeExample(i)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-colors cursor-pointer text-sm"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
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
