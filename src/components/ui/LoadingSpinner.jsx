export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className={`${sizes[size]} border-2 border-[var(--color-border)] border-t-[var(--color-ink)] rounded-full animate-spin`} />
    </div>
  )
}
