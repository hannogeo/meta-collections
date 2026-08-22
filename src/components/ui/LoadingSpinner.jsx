const sizes = {
  sm: { width: 20, height: 20, borderWidth: 1.5 },
  md: { width: 32, height: 32, borderWidth: 2 },
  lg: { width: 48, height: 48, borderWidth: 3 },
}

export default function LoadingSpinner({ size = 'md', fullPage = true }) {
  const s = sizes[size]

  const spinner = (
    <div
      className="rounded-full"
      style={{
        width: s.width,
        height: s.height,
        borderWidth: s.borderWidth,
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
        borderTopColor: 'var(--color-ink)',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  )
}
