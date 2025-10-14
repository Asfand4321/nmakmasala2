'use client'

import { useEffect, useMemo, useState } from 'react'

export type PermNode = {
  view?: boolean
  create?: boolean
  edit?: boolean
  delete?: boolean
  print?: boolean
  refund?: boolean
}
export type Permissions = {
  meals?: PermNode
  orders?: PermNode
  subscriptions?: PermNode
  deliveries?: PermNode
  payments?: PermNode
  settings?: PermNode
  menu?: PermNode
  customers?: PermNode
  support?: PermNode
  reports?: PermNode
}

export type AdminUser = {
  id: string
  name: string
  email?: string
  phone?: string
  role: 'owner'|'manager'
  enabled: boolean
  permissions: Permissions
}

const KEY = 'nm_admin_users'

const DEFAULT_OWNER: AdminUser = {
  id: 'owner-1',
  name: 'Owner',
  email: 'owner@example.com',
  role: 'owner',
  enabled: true,
  permissions: {
    meals:{view:true,create:true,edit:true,delete:true},
    orders:{view:true,edit:true,print:true},
    subscriptions:{view:true,edit:true,print:true},
    deliveries:{view:true,edit:true},
    payments:{view:true,refund:true},
    settings:{view:true,edit:true},
    menu:{view:true,edit:true},
    customers:{view:true},
    support:{view:true,edit:true},
    reports:{view:true},
  }
}

function load(): AdminUser[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) as AdminUser[] : [DEFAULT_OWNER]
    // ensure owner exists
    if (!arr.find(u => u.role === 'owner')) arr.unshift(DEFAULT_OWNER)
    return arr
  } catch {
    return [DEFAULT_OWNER]
  }
}
function save(list: AdminUser[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
}

export function useChildAccounts() {
  const [users, setUsers] = useState<AdminUser[]>([])

  useEffect(() => { setUsers(load()) }, [])

  const byId = useMemo(()=>{
    const m = new Map<string, AdminUser>()
    users.forEach(u=>m.set(u.id,u))
    return m
  },[users])

  function add(u: Omit<AdminUser,'id'|'enabled'>) {
    const id = `adm-${Date.now()}`
    const next: AdminUser = { ...u, id, enabled: true }
    const list = [next, ...users]
    setUsers(list); save(list)
    return next
  }

  function update(id: string, patch: Partial<AdminUser>) {
    const list = users.map(u => u.id === id ? { ...u, ...patch } : u)
    setUsers(list); save(list)
  }

  function remove(id: string) {
    // prevent deleting owner
    const u = users.find(x=>x.id===id)
    if (u?.role === 'owner') return
    const list = users.filter(u => u.id !== id)
    setUsers(list); save(list)
  }

  function toggleEnabled(id: string, enabled: boolean) {
    update(id, { enabled })
  }

  function seedManager() {
    const demo: Omit<AdminUser,'id'|'enabled'> = {
      name: 'Floor Manager',
      email: 'manager@example.com',
      phone: '+92-300-0000000',
      role: 'manager',
      permissions: {
        meals:{view:true,edit:true},
        orders:{view:true,edit:true,print:true},
        deliveries:{view:true,edit:true},
        subscriptions:{view:true},
        payments:{view:true},
        support:{view:true,edit:true},
      }
    }
    return add(demo)
  }

  return { users, byId, add, update, remove, toggleEnabled, seedManager, KEY }
}
