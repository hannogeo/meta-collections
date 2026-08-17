import { useState } from 'react'

export default function PasswordInput({ value, onChange, placeholder, label, id }) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-9 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] transition-colors cursor-pointer p-0.5"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8Z"/>
              <circle cx="8" cy="8" r="2"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 2.5l11 11"/>
              <path d="M6.5 6.5a2 2 0 0 0 2.6 2.6"/>
              <path d="M13.5 8S11 3 8 3C5.5 3 3.2 5 1.5 8c.5 1 1.3 2.2 2.5 3.2"/>
              <path d="M5 12.2C6 12.8 6.9 13 8 13c2.5 0 4.8-2 6.5-5-.2-.3-.4-.6-.6-.9"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
