import { avatarLetter } from '../../lib/avatar'

export default function Avatar({ username, color, size = 32, className = '' }) {
  const hasName = Boolean(username) && Boolean(color)
  if (!hasName) {
    return (
      <div
        className={`flex items-center justify-center rounded-full select-none ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: 'var(--color-border)',
        }}
      />
    )
  }
  const letter = avatarLetter(username)
  return (
    <div
      className={`flex items-center justify-center rounded-full select-none font-medium ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: Math.round(size * 0.45),
        color: '#fff',
      }}
    >
      {letter}
    </div>
  )
}