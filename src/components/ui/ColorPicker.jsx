export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <label
        className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface)] cursor-pointer transition-colors"
        title="Click to open the color picker"
      >
        <span className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
          <span className="absolute inset-0" style={{ backgroundColor: value }} />
          <span className="absolute inset-0 ring-2 ring-inset ring-black/10" />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer border-0 p-0 bg-transparent opacity-0"
          />
        </span>
        <span className="text-sm text-[var(--color-ink)]">Custom</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-faint)]">
          <path d="M12.6 2.9a2 2 0 0 1 2.5 2.5l-6.9 6.9-3.2.7.7-3.2 6.9-6.9z" />
        </svg>
      </label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-ink-faint)]">#</span>
        <input
          type="text"
          value={value.replace('#', '')}
          onChange={(e) => {
            let v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
            onChange('#' + v)
          }}
          className="w-24 px-2 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-lg text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors uppercase"
          placeholder="000000"
          maxLength={6}
          aria-label="Hex color"
        />
      </div>
    </div>
  )
}