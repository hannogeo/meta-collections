export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[var(--color-accent)] text-[var(--color-surface)] hover:bg-[var(--color-accent-hover)]',
    secondary: 'bg-transparent text-[var(--color-ink)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-raised)]',
    danger: 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)]',
    ghost: 'bg-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/40',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
