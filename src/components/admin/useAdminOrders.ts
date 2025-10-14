'use client'

import { useEffect, useMemo, useState } from 'react'

export type OrderStatus = 'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type OrderSource = 'meal' | 'plan'   // 👈 important

export type AdminOrder = {
  id: string
  createdAt: number
  status: OrderStatus
  customer?: { phone?: string }
  address?: string
  items: { name: string; qty: number; price: number }[]
  total: number
  source: OrderSource       // 👈 important
  note?: string
}

const KEY = 'nm_admin_orders'

function load(): AdminOrder[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AdminOrder[]) : []
  } catch { return [] }
}
function save(list: AdminOrder[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
}
function uid() { return 'ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2,7) }

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  useEffect(() => { setOrders(load()) }, [])

  const byId = useMemo(() => {
    const m = new Map<string, AdminOrder>()
    orders.forEach(o => m.set(o.id, o))
    return m
  }, [orders])

  function add(data: Omit<AdminOrder, 'id'|'createdAt'>) {
    const rec: AdminOrder = { ...data, id: uid(), createdAt: Date.now() }
    const next = [rec, ...orders]
    setOrders(next); save(next)
  }
  function update(id: string, patch: Partial<AdminOrder>) {
    const next = orders.map(o => o.id === id ? { ...o, ...patch } : o)
    setOrders(next); save(next)
  }
  function remove(id: string) {
    const next = orders.filter(o => o.id !== id)
    setOrders(next); save(next)
  }

  // Only MEAL seeds (no plan)
  function seedIfEmpty() {
    if (orders.length) return
    const phone = localStorage.getItem('nm_user_phone') || '03XXXXXXXXX'
    const sample: AdminOrder[] = [
      {
        id: uid(), createdAt: Date.now()-3600_000, status: 'placed',
        customer: { phone }, address: 'Demo Address, Lahore',
        items: [{ name:'Biryani', qty:1, price:420 }], total: 420, source: 'meal'
      },
      {
        id: uid(), createdAt: Date.now()-7200_000, status: 'preparing',
        customer: { phone }, address: 'Demo Address, Karachi',
        items: [{ name:'Qeema + Roti', qty:1, price:390 }], total: 390, source: 'meal'
      },
    ]
    setOrders(sample); save(sample)
  }

  return { orders, byId, add, update, remove, seedIfEmpty }
}
