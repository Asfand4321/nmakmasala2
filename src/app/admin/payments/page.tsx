'use client'

import { useMemo, useState } from 'react'
import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import { usePayments, PaymentMethod, MethodKind, Payment } from '@/components/admin/usePayments'

function fmt(ts: number) { return new Date(ts).toLocaleString() }

export default function AdminPaymentsPage() {
  const { methods, payments, addMethod, updateMethod, removeMethod } = usePayments()

  // Add method form
  const [name, setName] = useState('')
  const [kind, setKind] = useState<MethodKind>('online')

  // Filters for payments
  const [q, setQ] = useState('')
  const [typeF, setTypeF] = useState<'All'|'plan'|'meal'>('All')
  const [statusF, setStatusF] = useState<'All'|'paid'|'cod_pending'>('All')
  const [methodF, setMethodF] = useState<'All'|string>('All')

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const s = q.toLowerCase().trim()
      const needle = `${p.refId} ${p.phone ?? ''} ${p.email ?? ''} ${p.methodName}`.toLowerCase()
      const okQ = !s || needle.includes(s)
      const okT = typeF === 'All' ? true : p.refType === typeF
      const okS = statusF === 'All' ? true : p.status === statusF
      const okM = methodF === 'All' ? true : p.methodName === methodF
      return okQ && okT && okS && okM
    })
  }, [payments, q, typeF, statusF, methodF])

  function exportCSV() {
    const rows = [['id','createdAt','refType','refId','amount','method','kind','status','phone','email']]
    filtered.forEach(p => rows.push([
      p.id, new Date(p.createdAt).toISOString(), p.refType, p.refId, String(p.amount),
      p.methodName, p.methodKind, p.status, p.phone ?? '', p.email ?? ''
    ]))
    const csv = rows.map(r => r.map(c => {
      const s = String(c ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s
    }).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `payments_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">Payments</h1>
          <p className="muted">Manage payment methods & view payment records</p>
        </div>
      </div>

      {/* Methods manage */}
      <Card className="p-4 space-y-3">
        <div className="font-heading text-lg">Payment Methods</div>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-2">
          <input className="input" placeholder="Method name (e.g. JazzCash)" value={name} onChange={e=>setName(e.target.value)} />
          <select className="input" value={kind} onChange={e=>setKind(e.target.value as MethodKind)}>
            <option value="online">Online</option>
            <option value="cod">Cash on Delivery</option>
          </select>
          <button className="btn btn-primary" onClick={()=>{ if(!name.trim()) return; addMethod(name.trim(), kind); setName('') }}>Add</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {methods.map(m => (
            <div key={m.id} className="border border-taupe/40 rounded-xl px-3 py-2 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{m.name}</div>
                <div className="muted text-xs">{m.kind === 'online' ? 'Online' : 'Cash on Delivery'}</div>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={m.enabled}
                    onChange={(e)=>updateMethod(m.id, { enabled: e.target.checked })}
                  />
                  <span>{m.enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
                <button className="btn btn-outline" onClick={()=>removeMethod(m.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payments log */}
      <Card className="p-4 space-y-3">
        <div className="font-heading text-lg">Payments Log</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="input md:col-span-2" placeholder="Search ref/phone/email/method…" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={typeF} onChange={e=>setTypeF(e.target.value as any)}>
            <option>All</option><option value="plan">plan</option><option value="meal">meal</option>
          </select>
          <select className="input" value={statusF} onChange={e=>setStatusF(e.target.value as any)}>
            <option>All</option><option value="paid">paid</option><option value="cod_pending">cod_pending</option>
          </select>
          <select className="input" value={methodF} onChange={e=>setMethodF(e.target.value as any)}>
            <option>All</option>
            {Array.from(new Set(payments.map(p => p.methodName))).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={exportCSV}>Export CSV</button>
        </div>

        <div className="overflow-x-auto -mx-4">
          <table className="min-w-full text-sm">
            <thead className="bg-sand/60">
              <tr>
                <th className="text-left px-4 py-3">Ref</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-taupe/30">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{p.refId}</div>
                    <div className="muted text-xs">{p.refType}</div>
                  </td>
                  <td className="px-4 py-3 align-top">Rs {p.amount}</td>
                  <td className="px-4 py-3 align-top">
                    <div>{p.methodName}</div>
                    <div className="muted text-xs">{p.methodKind}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`chip ${p.status==='paid' ? 'bg-olive text-white border-olive' : ''}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div>{p.phone || '—'}</div>
                    <div className="muted text-xs">{p.email || ''}</div>
                  </td>
                  <td className="px-4 py-3 align-top">{fmt(p.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center muted">No payments match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
