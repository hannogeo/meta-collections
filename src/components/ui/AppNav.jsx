import { NavLink } from 'react-router-dom'

export default function AppNav({ current }) {
  const links = [
    { to: '/dashboard', key: 'dashboard', label: 'Dashboard' },
    { to: '/discover', key: 'discover', label: 'Discover' },
  ]

  return (
    <nav className="flex items-center gap-1">
      {links.map((l) => (
        <NavLink
          key={l.key}
          to={l.to}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            current === l.key
              ? 'font-medium text-[var(--color-ink)]'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/30'
          }`}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}