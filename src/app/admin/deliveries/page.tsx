'use client'

import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import { useMemo, useState } from 'react'
import { useSubscriptions, Subscription } from '@/components/admin/useSubscriptions'

function ymd(d = new Date()) {
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}
type Row = {
  subId: string
  plan: string
  userPhone: string
  address: string
  date: string
  slot: 1|2
  code: string
  status: 'pending'|'delivered'|'skipped'
  window: string
}
function windowLabel(s: Subscription, slot: 1|2) {
  const w = s.windows[slot-1]
  if (!w) return '—'
  return `${w.sh}:${w.sm} ${w.sap}–${w.eh}:${w.em} ${w.eap}`
}

export default function AdminDeliveriesPage() {
  const { subs, setDeliveryStatus } = useSubscriptions()
  const [todayOnly, setTodayOnly] = useState(true)
  const [q, setQ] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  const rows: Row[] = useMemo(() => {
    const rows: Row[] = []
    for (const s of subs) {
      for (const d of s.deliveries) {
        rows.push({
          subId: s.id,
          plan: s.planId.replace('-', ' • '),
          userPhone: s.userPhone,
          address: s.address,
          date: d.date,
          slot: d.slot,
          code: d.code,
          status: d.status,
          window: windowLabel(s, d.slot),
        })
      }
    }
    rows.sort((a,b)=> (a.date===b.date ? a.slot-b.slot : a.date.localeCompare(b.date)))
    return rows
  }, [subs])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return rows.filter(r => {
      const matchesToday = !todayOnly || r.date === ymd()
      const hay = `${r.code} ${r.subId} ${r.userPhone} ${r.address} ${r.plan}`.toLowerCase()
      return matchesToday && (!s || hay.includes(s))
    })
  }, [rows, q, todayOnly])

  function markByCode(code: string, status: 'delivered'|'pending'|'skipped' = 'delivered') {
    const hit = rows.find(r => r.code.toLowerCase() === code.trim().toLowerCase())
    if (!hit) { setFlash('Code not found'); setTimeout(()=>setFlash(null), 1000); return }
    setDeliveryStatus(hit.subId, hit.date, hit.slot, status)
    setFlash(`Marked ${status} — ${hit.code}`)
    setTimeout(()=>setFlash(null), 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">Deliveries</h1>
          <p className="muted">Scan/enter code to mark delivered • See today’s drops</p>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            className="input md:col-span-2"
            placeholder="Enter / scan delivery code (e.g., NM-XXXX-YYYYMMDD-1-1234-5678)"
            onKeyDown={(e:any) => { if (e.key === 'Enter') markByCode(e.target.value) }}
          />
          <button className="btn btn-primary" onClick={()=>{
            const el = document.querySelector<HTMLInputElement>('input[placeholder^="Enter / scan"]')
            if (el && el.value.trim()) markByCode(el.value.trim())
          }}>
            Mark Delivered
          </button>
          <label className="inline-flex items-center gap-2 justify-center">
            <input type="checkbox" checked={todayOnly} onChange={e=>setTodayOnly(e.target.checked)} />
            <span>Show only today</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="input" placeholder="Search code / phone / address / plan…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        {flash && <div className="chip">{flash}</div>}
      </Card>

      <Card className="p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-sand/60">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Slot</th>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Address</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">Window</th>
              <th className="text-right px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={`${r.subId}-${r.date}-${r.slot}`} className="border-t border-taupe/30">
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">Meal {r.slot}</td>
                <td className="px-4 py-3">{r.code}</td>
                <td className="px-4 py-3">{r.userPhone}</td>
                <td className="px-4 py-3 truncate max-w-[280px]">{r.address}</td>
                <td className="px-4 py-3">{r.plan}</td>
                <td className="px-4 py-3">{r.window}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <span className={`chip ${r.status==='delivered' ? 'bg-olive text-white border-olive' : ''}`}>{r.status}</span>
                    {r.status!=='delivered' && (
                      <button className="btn btn-primary" onClick={()=>markByCode(r.code,'delivered')}>Mark delivered</button>
                    )}
                    {r.status!=='pending' && (
                      <button className="btn btn-outline" onClick={()=>markByCode(r.code,'pending')}>Pending</button>
                    )}
                    {r.status!=='skipped' && (
                      <button className="btn btn-outline" onClick={()=>markByCode(r.code,'skipped')}>Skip</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center muted">No deliveries match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
