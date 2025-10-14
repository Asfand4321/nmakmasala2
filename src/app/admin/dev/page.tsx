'use client'

import { useState } from 'react'
import { useAdminOrders, AdminOrder } from '@/components/admin/useAdminOrders'
import Link from 'next/link'
import Card from '@/components/Card'
import Modal from '@/components/admin/Modal'

function fmt(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}
function money(n: number) { return `Rs ${n}` }

export default function AdminDevPage() {
  const { orders, add, update, remove, seedIfEmpty } = useAdminOrders()

  // MODALS STATE
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const addRandom = () => {
    const items = [
      { name: 'Biryani', qty: 1, price: 420 },
      { name: 'Qeema + Roti', qty: 1, price: 390 },
      { name: 'Daal + Roti', qty: 1, price: 250 },
    ]
    const picked = items[Math.floor(Math.random()*items.length)]
    const cartTotal = picked.qty * picked.price
    const rec: Omit<AdminOrder,'id'|'createdAt'> = {
      status: 'placed',
      customer: { phone: localStorage.getItem('nm_user_phone') || '0300XXXXXXX' },
      address: 'Demo Address, Lahore',
      windows: [
        { sh:'12',sm:'00',sap:'PM', eh:'01',em:'00',eap:'PM' },
        null
      ],
      items: [picked],
      cartTotal,
      total: 4000 + cartTotal,
      plan: { planId:'weekly-1', includedNonVeg:3, chosenNonVeg:2, extraNonVeg:0, planTotal:4000 },
      note: ''
    }
    add(rec)
  }

  const clearAll = () => {
    orders.forEach(o => remove(o.id))
  }

  // OPEN/CLOSE HELPERS
  const openCancel = (id: string) => { setCancelId(id); setCancelReason(''); }
  const confirmCancel = () => {
    if (!cancelId) return
    update(cancelId, { status: 'cancelled', note: cancelReason || 'Cancelled by admin' })
    setCancelId(null); setCancelReason('')
  }

  const openEditNote = (id: string, currentNote?: string) => {
    setEditId(id); setNote(currentNote || '')
  }
  const saveNote = () => {
    if (!editId) return
    update(editId, { note })
    setEditId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="h1">Admin Dev — Orders Debug</h1>
        <Link href="/admin" className="btn btn-outline">↩ Back to Admin</Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button className="btn btn-primary" onClick={seedIfEmpty}>Seed sample orders</button>
        <button className="btn btn-outline" onClick={addRandom}>Add random order</button>
        <button className="btn btn-outline" onClick={clearAll}>Clear all</button>
      </div>

      <Card className="p-3">
        <div className="font-heading">Total orders: {orders.length}</div>
      </Card>

      <div className="space-y-2">
        {orders.map(o => (
          <Card key={o.id} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{o.id} • {o.customer.phone || 'N/A'}</div>
                <div className="muted text-sm">{fmt(o.createdAt)} • {o.address}</div>
                <div className="muted text-sm">Items: {o.items.map(i=>`${i.name}×${i.qty}`).join(', ')}</div>
                {o.note ? <div className="muted text-sm">Note: {o.note}</div> : null}
              </div>
              <div className="text-right">
                <div className="chip capitalize">{o.status.replaceAll('_',' ')}</div>
                <div className="font-heading">{money(o.total)}</div>
              </div>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <button className="btn btn-outline" onClick={()=>update(o.id, { status:'preparing' })}>Set Preparing</button>
              <button className="btn btn-outline" onClick={()=>update(o.id, { status:'out_for_delivery' })}>Set Out</button>
              <button className="btn btn-outline" onClick={()=>update(o.id, { status:'delivered' })}>Set Delivered</button>
              <button className="btn btn-outline" onClick={()=>openCancel(o.id)}>Cancel…</button>
              <button className="btn btn-outline" onClick={()=>openEditNote(o.id, o.note)}>Edit note…</button>
              <button className="btn btn-outline" onClick={()=>remove(o.id)}>Delete</button>
            </div>
          </Card>
        ))}
      </div>

      {/* CANCEL MODAL */}
      <Modal
        open={!!cancelId}
        title="Cancel order"
        onClose={()=>{ setCancelId(null); setCancelReason('') }}
      >
        <p className="muted mb-2">Write a brief reason. This will be saved to the order note.</p>
        <textarea
          className="input w-full h-28"
          placeholder="e.g. Customer unreachable / Address not found"
          value={cancelReason}
          onChange={(e)=>setCancelReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={()=>{ setCancelId(null); setCancelReason('') }}>Close</button>
          <button className="btn btn-primary" onClick={confirmCancel}>Confirm cancel</button>
        </div>
      </Modal>

      {/* NOTE MODAL */}
      <Modal
        open={!!editId}
        title="Edit internal note"
        onClose={()=>setEditId(null)}
      >
        <textarea
          className="input w-full h-28"
          placeholder="Internal note…"
          value={note}
          onChange={(e)=>setNote(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={()=>setEditId(null)}>Close</button>
          <button className="btn btn-primary" onClick={saveNote}>Save</button>
        </div>
      </Modal>
    </div>
  )
}
