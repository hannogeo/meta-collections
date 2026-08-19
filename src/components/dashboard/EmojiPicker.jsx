import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

function getEmojiChar(emoji) {
  if (emoji.native) return emoji.native
  if (emoji.unified) {
    return emoji.unified
      .split('-')
      .map((h) => String.fromCodePoint(parseInt(h, 16)))
      .join('')
  }
  return null
}

export default function EmojiPicker({ value, onChange, onClear, children }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const pickerRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (
        wrapperRef.current?.contains(e.target) ||
        pickerRef.current?.contains(e.target)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleToggle() {
    if (!open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      const pickerWidth = 352
      const pickerHeight = 420
      let left = rect.left
      let top = rect.bottom + 4

      if (left + pickerWidth > window.innerWidth) {
        left = window.innerWidth - pickerWidth - 8
      }
      if (left < 0) left = 8
      if (top + pickerHeight > window.innerHeight) {
        top = rect.top - pickerHeight - 4
      }

      setPosition({ top, left })
    }
    setOpen((v) => !v)
  }

  function handleSelect(emoji) {
    const char = getEmojiChar(emoji)
    if (char) {
      onChange(char)
    }
    setOpen(false)
  }

  return (
    <div className="relative inline-flex" ref={wrapperRef}>
      <div onClick={handleToggle} className="cursor-pointer">
        {children}
      </div>
      {open && createPortal(
        <div
          ref={pickerRef}
          className="fixed z-[10000] shadow-xl rounded-lg overflow-hidden border border-[var(--color-border)]"
          style={{ top: position.top, left: position.left }}
        >
          <Picker
            data={data}
            onEmojiSelect={handleSelect}
            theme="auto"
            previewPosition="none"
            skinTonePosition="search"
            maxFrequentRows={2}
            perLine={8}
          />
        </div>,
        document.body
      )}
    </div>
  )
}
