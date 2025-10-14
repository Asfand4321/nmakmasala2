'use client'

import Illustration from '@/components/Illustration'
import Card from '@/components/Card'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'

export default function CartPage() {
  const { items, total } = useCart()

  if (!items || items.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Illustration variant="cart" size={64} />
          <h1 className="h1 m-0">Your cart is empty</h1>
        </div>
        <p className="muted">Add a few meals or pick a plan to get started.</p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/meals" className="btn btn-primary">Browse Meals</Link>
          <Link href="/plans" className="btn btn-outline">Plans</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="cart" size={64} />
        <h1 className="h1 m-0">Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((it: any) => (
            <Card key={it.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-heading text-lg truncate">{it.name}</div>
                  <div className="muted text-sm">Qty: {it.qty ?? 1}</div>
                </div>
                <div className="font-medium">Rs {(it.price ?? 0) * (it.qty ?? 1)}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="p-4 space-y-3">
          <div className="font-heading text-lg">Summary</div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium">Rs {total}</span>
          </div>
          <div className="muted text-sm">Taxes and delivery calculated at checkout.</div>
          <Link href="/checkout" className="btn btn-primary w-full text-center">Go to Checkout</Link>
          <Link href="/meals" className="btn btn-outline w-full text-center">Add more meals</Link>
        </Card>
      </div>
    </div>
  )
}
