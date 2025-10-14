'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  position?: 'right' | 'left'  // default: right
  label?: string               // default: WhatsApp us
  message?: string             // optional prefill message
}

export default function WhatsAppButton({ position='right', label='WhatsApp us', message }: Props) {
  const [phone, setPhone] = useState<string>('+923331273389') // fallback
  // SSR-safe static message (hostname na use karein to hydration mismatch nahi aayega)
  const safeMsg = message || 'Salam! I need help with my order/plan.'

  // read from Admin Settings (nm_admin_settings) on client
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nm_admin_settings')
      if (raw) {
        const biz = JSON.parse(raw)
        if (biz?.phone) setPhone(String(biz.phone).replace(/\s+/g, ''))
      }
    } catch {}
  }, [])

  // href building: deterministic on SSR (phone fallback + static message), client me phone update ho sakta hai (allowed)
  const href = useMemo(() => {
    const base = `https://wa.me/${phone.replace(/[^\d+]/g, '')}`
    return `${base}?text=${encodeURIComponent(safeMsg)}`
  }, [phone, safeMsg])

  const posClass = position === 'left' ? 'left-4' : 'right-4'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Chat"
      className={`fixed ${posClass} bottom-4 z-50 rounded-full shadow-soft bg-olive text-white hover:bg-olive-700 focus:ring-2 focus:ring-olive/50`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
          <path fill="currentColor" d="M19.11 17.41c-.29-.15-1.69-.83-1.95-.92c-.26-.1-.45-.15-.64.15c-.19.3-.73.92-.9 1.11c-.17.19-.33.21-.62.08c-.29-.15-1.22-.45-2.33-1.44c-.86-.76-1.45-1.69-1.62-1.98c-.17-.3-.02-.46.13-.61c.14-.14.3-.33.45-.49c.15-.17.19-.29.29-.49c.1-.19.05-.37-.02-.53c-.07-.15-.64-1.55-.88-2.13c-.23-.56-.47-.49-.64-.49h-.55c-.19 0-.5.07-.76.37c-.26.3-1 1-1 2.44c0 1.44 1.03 2.82 1.17 3.01c.15.19 2.02 3.08 4.9 4.31c.69.3 1.23.48 1.65.61c.69.22 1.32.19 1.82.12c.56-.08 1.69-.69 1.93-1.36c.24-.67.24-1.24.17-1.36c-.07-.12-.26-.19-.55-.33zM26.88 5.12A13.94 13.94 0 1 0 2.06 22.08L1 27l5.07-1.06A13.94 13.94 0 1 0 26.88 5.12zM16 28.14c-2.38 0-4.58-.7-6.42-1.9l-4.48 1l.95-4.37A12.13 12.13 0 1 1 28.14 16A12.14 12.14 0 0 1 16 28.14z"/>
        </svg>
        <span className="hidden sm:inline font-medium">{label}</span>
      </div>
    </a>
  )
}
