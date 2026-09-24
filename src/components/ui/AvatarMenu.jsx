import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { avatarColorFromUsername } from '../../lib/avatar'
import Avatar from './Avatar'

export default function AvatarMenu({ size = 30 }) {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const ref = useRef(null)
  const closeTimer = useRef(null)

  const username = userProfile?.username || ''
  const color = userProfile?.avatarColor || avatarColorFromUsername(username)

  function openMenu() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOpen(true)
    setClosing(false)
  }

  function closeMenu() {
    if (!open || closing) return
    setClosing(true)
    closeTimer.current = setTimeout(() => {
      setOpen(false)
      setClosing(false)
      closeTimer.current = null
    }, 120)
  }

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) closeMenu()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, closing])

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <button
        onClick={() => (open ? closeMenu() : openMenu())}
        className="rounded-full hover:ring-2 hover:ring-[var(--color-accent)]/40 transition-shadow cursor-pointer"
        title={username}
        aria-label="Account menu"
      >
        <Avatar username={username} color={color} size={size} />
      </button>
      {(open || closing) && (
        <>
          <div className="absolute right-0 top-full w-40 h-2" />
          <div
            className={`absolute right-0 top-full mt-2 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-md shadow-sm py-1 w-40 z-50 ${
              closing ? 'animate-menu-pop-out' : 'animate-menu-pop-in'
            }`}
          >
            <div className="px-3 py-1.5 text-xs text-[var(--color-ink-faint)] truncate border-b border-[var(--color-border)]/50 mb-1">
              {username}
            </div>
            <button
              onClick={() => {
                closeMenu()
                navigate('/settings')
              }}
              className="w-full text-left px-3 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-border)]/30 transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  )
}