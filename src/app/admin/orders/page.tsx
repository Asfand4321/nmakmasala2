'use client'

import { useMemo, useState } from 'react'
import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import Modal from '@/components/admin/Modal'
import { useAdminOrders, AdminOrder } from '@/components/admin/useAdminOrders'
import { usePayments } from '@/components/admin/usePayments'

type Status = AdminOrder['status']
function fmt(ts: number) { return new Date(ts).toLocaleString() }
function money(n: number) { return `Rs ${n}` }
function itemsText(items: {name:string; qty:number; price:number}[]) {
  return items.map(i => `${i.name}×${i.qty}`).join(', ')
}
function withinRange(ts: number, from?: string, to?: string) {
  if (!from && !to) return true
  const d = new Date(ts)
  if (from && d < new Date(from + 'T00:00:00')) return false
  if (to   && d > new Date(to   + 'T23:59:59')) return false
  return true
}

export default function AdminOrdersPage() {
  const { orders, update, remove, seedIfEmpty } = useAdminOrders()
  const { payments } = usePayments() // to show payment method/status on invoice

  // 👉 MEAL ONLY
  const mealOrders = useMemo(() => orders.filter(o => o.source === 'meal'), [orders])

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'All'|Status>('All')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const [cancelId, setCancelId] = useState<string|null>(null)
  const [reason, setReason] = useState('')

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return mealOrders.filter(o => {
      const matchesSearch = !s
        || o.id.toLowerCase().includes(s)
        || (o.customer?.phone || '').toLowerCase().includes(s)
        || (o.address || '').toLowerCase().includes(s)
      const matchesStatus = (status === 'All') ? true : o.status === status
      const matchesDate = withinRange(o.createdAt, from || undefined, to || undefined)
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [mealOrders, q, status, from, to])

  function exportCSV() {
    const rows = [['id','createdAt','status','phone','address','items','total']]
    filtered.forEach(o => rows.push([
      o.id, new Date(o.createdAt).toISOString(), o.status,
      o.customer?.phone || '', o.address || '', itemsText(o.items || []), String(o.total ?? 0)
    ]))
    const csv = rows.map(r => r.map(c => {
      const s = String(c ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s
    }).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `orders_meal_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  const set = (o: AdminOrder, s: Status) => update(o.id, { status: s })
  const openCancel = (o: AdminOrder) => { setCancelId(o.id); setReason('') }
  const confirmCancel = () => {
    if (!cancelId) return
    update(cancelId, { status: 'cancelled', note: reason || 'Cancelled by admin' })
    setCancelId(null); setReason('')
  }

  function printBill(o: AdminOrder) {
    try {
    // Read business info from Admin Settings
    let biz = { name: 'Namak Masaala', phone: '+92-3XXXXXXXXX', address: 'Lahore, Pakistan' }
    try {
      const raw = localStorage.getItem('nm_admin_settings')
      if (raw) biz = JSON.parse(raw)
    } catch {}
    const company = biz.name
    const companyPhone = biz.phone
    const companyAddr = biz.address
    const logoUrl = '/logo.png'
      // Payment info (if any)
      const pay = payments.find(p => p.refType === 'meal' && p.refId === o.id)
      const method = pay?.methodName || (pay?.methodKind === 'cod' ? 'Cash on Delivery' : '—')
      const status = pay?.status || (pay?.methodKind === 'cod' ? 'cod_pending' : 'paid')


      const rows = (o.items || []).map((it, idx) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${idx+1}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${it.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${it.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">Rs ${it.price}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">Rs ${it.price * (it.qty||1)}</td>
        </tr>
      `).join('')

      const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Invoice ${o.id}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  @media print {
    .no-print { display: none !important; }
  }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #333; }
  .wrap { max-width: 800px; margin: 0 auto; padding: 24px; }
  .muted { color: #6b6b6b; }
  .h1 { font-size: 22px; margin: 0; }
  .chip { display:inline-block; padding:4px 8px; border-radius:12px; border:1px solid #cbb; background:#F1E7DA; }
  .totals td { padding:6px 8px; }
  .totals .lab { text-align:right; }
  .divider { border-top:1px dashed #ccc; margin:12px 0; }
  .head { display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .logo { width:48px; height:48px; border-radius:10px; overflow:hidden; }
  .logo img { width:100%; height:100%; object-fit:cover; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="logo"><img src="${logoUrl}" alt="logo"/></div>
        <div>
          <div class="h1">${company}</div>
          <div class="muted" style="font-size:12px;">${companyAddr} • ${companyPhone}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="chip">MEAL ORDER</div>
        <div class="muted" style="font-size:12px;">${new Date(o.createdAt).toLocaleString()}</div>
      </div>
    </div>

    <div style="margin-top:12px;">
      <div><strong>Invoice #</strong> ${o.id}</div>
      <div><strong>Status</strong> ${o.status.replaceAll('_',' ')}</div>
      <div><strong>Payment</strong> ${method} • <span class="muted">${status}</span></div>
    </div>

    <div class="divider"></div>

    <div style="display:flex; gap:24px; flex-wrap:wrap;">
      <div style="min-width:260px;">
        <div style="font-weight:600; margin-bottom:6px;">Bill To</div>
        <div><strong>Phone:</strong> ${o.customer?.phone || '—'}</div>
        <div><strong>Address:</strong> ${o.address || '—'}</div>
      </div>
      <div style="min-width:200px;">
        <div style="font-weight:600; margin-bottom:6px;">Summary</div>
        <div><strong>Items:</strong> ${(o.items||[]).length}</div>
        <div><strong>Total:</strong> Rs ${o.total ?? 0}</div>
      </div>
    </div>

    <div style="margin-top:12px; overflow:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="background:#F7F2EA;">
            <th style="text-align:left; padding:8px;">#</th>
            <th style="text-align:left; padding:8px;">Item</th>
            <th style="text-align:center; padding:8px;">Qty</th>
            <th style="text-align:right; padding:8px;">Price</th>
            <th style="text-align:right; padding:8px;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="5" style="padding:10px;text-align:center;" class="muted">No items</td></tr>`}
        </tbody>
      </table>
    </div>

    <table class="totals" style="width:100%; margin-top:12px;">
      <tr><td class="lab">Subtotal</td><td style="text-align:right;">Rs ${o.total ?? 0}</td></tr>
      <tr><td class="lab">Delivery</td><td style="text-align:right;">Rs 0</td></tr>
      <tr><td class="lab" style="font-weight:700;">Grand Total</td><td style="text-align:right; font-weight:700;">Rs ${o.total ?? 0}</td></tr>
    </table>

    <div class="divider"></div>
    <div class="muted" style="font-size:12px;">Thank you! This is a demo invoice (local storage). For production, connect real payment gateway & order API.</div>

    <div style="margin-top:16px;">
      <button class="no-print" onclick="window.print()" style="padding:8px 12px; border-radius:10px; border:1px solid #bbb; background:#fff;">Print</button>
    </div>
  </div>

  <script>
    // auto print, then focus window
    setTimeout(() => { try { window.print() } catch(e){} }, 300);
  </script>
</body>
</html>
      `.trim()

      const w = window.open('', '_blank', 'width=900,height=800')
      if (!w) return alert('Popup blocked. Please allow popups to print.')
      w.document.open()
      w.document.write(html)
      w.document.close()
      w.focus()
    } catch (e) {
      console.error(e)
      alert('Unable to generate invoice.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">Orders (Meals only)</h1>
          <p className="muted">One-off taste orders from Meals page</p>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="input md:col-span-2" placeholder="Search id / phone / address…" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>All</option><option>placed</option><option>preparing</option><option>out_for_delivery</option><option>delivered</option><option>cancelled</option>
          </select>
          <input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          <input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-outline" onClick={seedIfEmpty}>Seed sample</button>
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-sand/60">
            <tr>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Items</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t border-taupe/30">
                <td className="px-4 py-3 align-top">
                  <div className="font-medium">{o.id}</div>
                  <div className="muted">{fmt(o.createdAt)}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div>{o.customer?.phone || '—'}</div>
                  <div className="muted text-xs truncate max-w-[240px]">{o.address || ''}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="muted truncate max-w-[320px]">{itemsText(o.items || []) || '—'}</div>
                </td>
                <td className="px-4 py-3 align-top"><div className="font-heading">{money(o.total ?? 0)}</div></td>
                <td className="px-4 py-3 align-top">
                  <span className={`chip capitalize ${o.status==='delivered' ? 'bg-olive text-white border-olive' : ''}`}>
                    {o.status.replaceAll('_',' ')}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex gap-2 justify-end flex-wrap">
                    <button className="btn btn-outline" onClick={()=>set(o,'preparing')}>Preparing</button>
                    <button className="btn btn-outline" onClick={()=>set(o,'out_for_delivery')}>Out</button>
                    <button className="btn btn-outline" onClick={()=>set(o,'delivered')}>Delivered</button>
                    <button className="btn btn-outline" onClick={()=>openCancel(o)}>Cancel…</button>
                    <button className="btn btn-outline" onClick={()=>remove(o.id)}>Delete</button>
                    <button className="btn btn-primary" onClick={()=>printBill(o)}>Print Bill</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center muted">No meal orders match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={!!cancelId} title="Cancel order" onClose={()=>{ setCancelId(null); setReason('') }}>
        <p className="muted mb-2">Reason (will be saved in order note):</p>
        <textarea className="input w-full h-28" placeholder="e.g. Customer unreachable"
          value={reason} onChange={e=>setReason(e.target.value)} />
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={()=>{ setCancelId(null); setReason('') }}>Close</button>
          <button className="btn btn-primary" onClick={confirmCancel}>Confirm cancel</button>
        </div>
      </Modal>
    </div>
  )
}
