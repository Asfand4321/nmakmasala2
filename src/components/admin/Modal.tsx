'use client'

import { useEffect } from 'react'

export default function Modal({
  open,
  title,
  onClose,
  children,
  actions,
  maxWidth = 'max-w-lg',
}: {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  actions?: React.ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`card w-full ${maxWidth} p-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading text-lg">{title ?? 'Confirm'}</h3>
          <button className="chip" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="mt-2">{children}</div>
        {actions && <div className="mt-4 flex items-center gap-2 justify-end">{actions}</div>}
      </div>
    </div>
  )
}
