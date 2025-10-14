'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
}

type AddInput = { id?: string; name: string; price: number; qty?: number }

type CartCtx = {
  items: CartItem[]
  add: (item: AddInput) => void
  remove: (id: string) => void
  clear: () => void
  inc: (id: string) => void
  dec: (id: string) => void
  setQty: (id: string, qty: number) => void
  count: number
  total: number
}

const CartContext = createContext<CartCtx | undefined>(undefined)

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add = (item: AddInput) => {
    setItems(prev => {
      const id = item.id ?? item.name.toLowerCase().replace(/\s+/g, '-')
      const found = prev.find(i => i.id === id)
      if (found) {
        return prev.map(i => (i.id === id ? { ...i, qty: i.qty + (item.qty ?? 1) } : i))
      }
      return [...prev, { id, name: item.name, price: item.price, qty: item.qty ?? 1 }]
    })
  }

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const clear = () => setItems([])

  const inc = (id: string) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))

  const dec = (id: string) =>
    setItems(prev =>
      prev.flatMap(i => {
        if (i.id !== id) return [i]
        const nextQty = i.qty - 1
        return nextQty > 0 ? [{ ...i, qty: nextQty }] : []
      })
    )

  const setQty = (id: string, qty: number) =>
    setItems(prev =>
      qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => (i.id === id ? { ...i, qty } : i))
    )

  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items])
  const total = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items])

  const value = useMemo<CartCtx>(
    () => ({ items, add, remove, clear, inc, dec, setQty, count, total }),
    [items, count, total]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
