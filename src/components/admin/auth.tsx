'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { AdminUser } from './useChildAccounts'
import { useChildAccounts } from './useChildAccounts'

const KEY_CUR = 'nm_admin_current'

const AdminAuthCtx = createContext<{
  current: AdminUser | null
  setCurrentId: (id: string) => void
}>({ current: null, setCurrentId: () => {} })

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { users, byId } = useChildAccounts()
  const [current, setCurrent] = useState<AdminUser | null>(null)

  useEffect(() => {
    try {
      const id = localStorage.getItem(KEY_CUR)
      if (id && byId.has(id)) {
        setCurrent(byId.get(id)!)
      } else {
        const owner = users.find(u => u.role === 'owner') || null
        if (owner) {
          setCurrent(owner)
          localStorage.setItem(KEY_CUR, owner.id)
        }
      }
    } catch {}
  }, [users, byId])

  function setCurrentId(id: string) {
    if (!byId.has(id)) return
    const u = byId.get(id)!
    setCurrent(u)
    try { localStorage.setItem(KEY_CUR, id) } catch {}
  }

  return (
    <AdminAuthCtx.Provider value={{ current, setCurrentId }}>
      {children}
    </AdminAuthCtx.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthCtx)
}
