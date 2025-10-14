'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/Card'
import Modal from '@/components/Modal'

/** ---------- Types ---------- */
type Status = 'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

type OrderItem = {
  name: string
  qty: number
  price: number
}

type AdminOrder = {
  id: string
  items: OrderItem[]
  total: number
  status: Status
  customer: { phone: string }
  address: string
  createdAt: string
  note?: string
  source: 'meal' | 'plan'
}

/** ---------- Utils (inline helpers) ---------- */
function money(n: number) {
  return `Rs ${n.toLocaleString('en-PK')}`
}
function fmt(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}

/** ---------- LocalStorage helpers ---------- */
const KEY = 'nm_admin_orders'

function loadOrders(): AdminOrder[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as AdminOrder[]) : []
    // filter: sirf “meals waale taste orders” show karo (plans alag page pe)
    return arr.filter(o => o.source === 'meal')
  } catch {
    return []
  }
}

function saveOrders(mealOrders: AdminOrder[]) {
  try {
    // storage ke andar “non-meal” orders ko preserve rakhna (e.g. plan subscriptions)
    const raw = localStorage.getItem(KEY)
    const all = raw ? (JSON.parse(raw) as AdminOrder[]) : []
    const nonMeals = all.filter(o => o.source !== 'meal')
    const next = [...mealOrders, ...nonMeals]
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
}

/** ---------- Hook: useAdminMealOrders ---------- */
function useAdminMealOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])

  useEffect(() => {
    setOrders(loadOrders())
  }, [])

  const update = (id: string, patch: Partial<AdminOrder>) => {
    setOrders(prev => {
      const next = prev.map(o => (o.id === id ? { ...o, ...patch } : o))
      saveOrders(next)
      return next
    })
  }

  const remove = (id: string) => {
    setOrders(prev => {
      const next = prev.filter(o => o.id !== id)
      saveOrders(next)
      return next
    })
  }

  const clearAllMeals = () => {
    setOrders(() => {
      const next: AdminOrder[] = []
      saveOrders(next)
      return next
    })
  }

  return { orders, update, remove, clearAllMeals, setOrders }
}

/** ---------- Page Component ---------- */
export default function AdminOrdersPage() {
  const { orders, update, remove, clearAllMeals } = useAdminMealOrders()

  // UI state (cancel/note modals)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const count = orders.length
  const totals = useMemo(
    () => ({
      placed: orders.filter(o => o.status === 'placed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      out: orders.filter(o => o.status === 'out_for_delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      revenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((s, o) => s + o.total, 0),
    }),
    [orders]
  )

  function openCancel(id: string) {
    setCancelId(id)
    setCancelReason('')
  }
  function confirmCancel() {
    if (!cancelId) return
    const prev = orders.find(o => o.id === cancelId)
    const newNote = [prev?.note, cancelReason].filter(Boolean).join(' | ')
    update(cancelId, { status: 'cancelled', note: newNote })
    setCancelId(null); setCancelReason('')
  }
  function openEditNote(id: string, existing?: string) {
    setEditId(id)
    setNote(existing || '')
  }
  function saveNote() {
    if (!editId) return
    update(editId, { note })
    setEditId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="h1 m-0">Admin · Orders (Meals only)</h1>
          <p className="muted">
            Ye page sirf <span className="font-medium">meals wale taste orders</span> dikhata hai.
            Plans/subscriptions <span className="font-medium">/admin/subscriptions</span> par hain.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="chip">Total: {count}</span>
          <span className="chip">Placed: {totals.placed}</span>
          <span className="chip">Prep: {totals.preparing}</span>
          <span className="chip">Out: {totals.out}</span>
          <span className="chip">Delivered: {totals.delivered}</span>
          <span className="chip">Cancelled: {totals.cancelled}</span>
          <span className="chip">Revenue: {money(totals.revenue)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="btn btn-outline"
          onClick={() => {
            if (confirm('Clear ALL meal orders? This cannot be undone.')) clearAllMeals()
          }}
        >
          Clear Meal Orders
        </button>
        <a className="btn btn-outline" href="/admin/dev">Dev Tools</a>
      </div>

      {/* List */}
      <div className="space-y-3">
        {orders.map(o => (
          <Card key={o.id} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{o.id} • {o.customer.phone || 'N/A'}</div>
                <div className="muted text-sm">{fmt(o.createdAt)} • {o.address}</div>
                <div className="muted text-sm">
                  Items: {o.items.map(i => `${i.name}×${i.qty}`).join(', ')}
                </div>
                {o.note ? <div className="muted text-sm">Note: {o.note}</div> : null}
              </div>
              <div className="text-right">
                <div className="chip capitalize">{o.status.replaceAll('_', ' ')}</div>
                <div className="font-heading">{money(o.total)}</div>
              </div>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <button className="btn btn-outline" onClick={() => update(o.id, { status: 'preparing' })}>Set Preparing</button>
              <button className="btn btn-outline" onClick={() => update(o.id, { status: 'out_for_delivery' })}>Set Out</button>
              <button className="btn btn-outline" onClick={() => update(o.id, { status: 'delivered' })}>Set Delivered</button>
              <button className="btn btn-outline" onClick={() => openCancel(o.id)}>Cancel…</button>
              <button className="btn btn-outline" onClick={() => openEditNote(o.id, o.note)}>Edit note…</button>
              <button className="btn btn-outline" onClick={() => remove(o.id)}>Delete</button>
            </div>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card className="p-6 muted text-center">No meal orders yet.</Card>
        )}
      </div>

      {/* CANCEL MODAL */}
      <Modal
        open={!!cancelId}
        title="Cancel order"
        onClose={() => { setCancelId(null); setCancelReason('') }}
      >
        <p className="muted mb-2">Write a brief reason. This will be saved to the order note.</p>
        <textarea
          className="input w-full h-28"
          placeholder="e.g. Customer unreachable / Address not found"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={() => { setCancelId(null); setCancelReason('') }}>Close</button>
          <button className="btn btn-primary" onClick={confirmCancel}>Confirm cancel</button>
        </div>
      </Modal>

      {/* NOTE MODAL */}
      <Modal
        open={!!editId}
        title="Edit internal note"
        onClose={() => setEditId(null)}
      >
        <textarea
          className="input w-full h-28"
          placeholder="Internal note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={() => setEditId(null)}>Close</button>
          <button className="btn btn-primary" onClick={saveNote}>Save</button>
        </div>
      </Modal>
    </div>
  )
}
