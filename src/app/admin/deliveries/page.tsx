'use client'

import { useState } from 'react'

type Status = 'placed' | 'preparing' | 'delivered' | 'cancelled'
type AdminOrder = {
  id: string
  source: 'meal' | 'plan'
  item: string
  status: Status
  price: number
  customer: { phone: string }
  address: string
  createdAt: string
}

// LocalStorage helpers
function loadOrders(): AdminOrder[] {
  try {
    const raw = localStorage.getItem('nm_admin_orders')
    return raw ? (JSON.parse(raw) as AdminOrder[]) : []
  } catch {
    return []
  }
}
function saveOrders(list: AdminOrder[]) {
  try { localStorage.setItem('nm_admin_orders', JSON.stringify(list)) } catch {}
}

export default function AdminDevPage() {
  const [count, setCount] = useState(0)

  const seedMealOrder = () => {
    const list = loadOrders()
    const o: AdminOrder = {
      id: `NM-${Date.now()}`,
      source: 'meal',
      item: 'Chicken Biryani',
      status: 'placed',
      price: 420,
      customer: { phone: localStorage.getItem('nm_user_phone') || '0300XXXXXXX' },
      address: 'Demo Address Lahore',
      createdAt: new Date().toISOString(),
    }
    const next = [o, ...list]
    saveOrders(next)
    setCount(next.length)
    alert('Seeded 1 meal order for admin/orders')
  }

  const clearOrders = () => {
    saveOrders([])
    setCount(0)
    alert('Cleared admin orders')
  }

  return (
    <div className="space-y-4">
      <h1 className="h1">Admin Dev Tools</h1>
      <p className="muted">Quick seed for demo. (No windows field used)</p>

      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={seedMealOrder}>Seed Meal Order</button>
        <button className="btn btn-outline" onClick={clearOrders}>Clear Orders</button>
      </div>

      <div className="chip">Current orders count: {count}</div>
      <p className="muted text-sm">Go check: <span className="font-medium">/admin/orders</span></p>
    </div>
  )
}
