export default function Logo({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#c8492b" />
      <path
        d="M16 5.4c-4 0-7.2 3.2-7.2 7.2 0 4.4 3.2 7.9 7.2 13.4 4-5.5 7.2-9 7.2-13.4 0-4-3.2-7.2-7.2-7.2z"
        fill="#fbf8f1"
      />
      <circle cx="16" cy="12.6" r="2.6" fill="#c8492b" />
    </svg>
  )
}
