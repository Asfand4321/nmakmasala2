'use client'

import { useEffect, useState } from 'react'

export type BizSettings = {
  name: string
  phone: string
  address: string
}

const KEY = 'nm_admin_settings'

function load(): BizSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as BizSettings
  } catch {}
  return { name: 'Namak Masaala', phone: '+92-3XXXXXXXXX', address: 'Lahore, Pakistan' }
}

export function useSettings() {
  const [settings, setSettings] = useState<BizSettings>({ name:'', phone:'', address:'' })
  useEffect(() => { setSettings(load()) }, [])
  function save(next: BizSettings) {
    setSettings(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  }
  return { settings, save, KEY }
}
