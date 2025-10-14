'use client'

import Card from '@/components/Card'
import Illustration from '@/components/Illustration'

type UserOrder = {
  id: string
  createdAt: number
  status: 'placed' | 'preparing' | 'delivered' | 'cancelled'
  items: { name: string; qty: number; price: number }[]
  total: number
}

function fmt(ts: number) { return new Date(ts).toLocaleString() }

export default function OrdersPage() {
  const orders: UserOrder[] = (() => {
    try { return JSON.parse(localStorage.getItem('nm_user_orders') || '[]') } catch { return [] }
  })()

  if (!orders.length) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Illustration variant="pin" size={72} />
          <h1 className="h1 m-0">My Orders</h1>
        </div>
        <p className="muted">No one-off meal orders yet. Add from Meals and checkout.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Illustration variant="pin" size={72} />
        <h1 className="h1 m-0">My Orders</h1>
      </div>

      <div className="space-y-3">
        {orders.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-heading">{o.id}</div>
                <div className="muted text-sm">{fmt(o.createdAt)}</div>
                <div className="muted text-sm">
                  {o.items.map(i => `${i.name}×${i.qty}`).join(', ')}
                </div>
              </div>
              <div className="text-right">
                <div className="chip capitalize">{o.status}</div>
                <div className="font-heading">Rs {o.total}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
