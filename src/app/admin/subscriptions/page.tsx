'use client'

import { useMemo, useState } from 'react'
import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import { useSubscriptions, Subscription, ChoiceRow } from '@/components/admin/useSubscriptions'

function fmt(ts: number) { return new Date(ts).toLocaleString() }
function money(n: number) { return `Rs ${n}` }
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat']

function menuTableHTML(weekMenu: ChoiceRow[], isTwoMeals: boolean) {
  const rows = DAYS.map((d, i) => {
    const row = weekMenu[i] || []
    const m1 = row[0] ? `${row[0]!.dish} (${row[0]!.cat})` : '—'
    const m2 = isTwoMeals ? (row[1] ? `${row[1]!.dish} (${row[1]!.cat})` : '—') : ''
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${d}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${m1}</td>
      ${isTwoMeals ? `<td style="padding:8px;border-bottom:1px solid #eee;">${m2}</td>` : ``}
    </tr>`
  }).join('')
  const head = `<tr style="background:#F7F2EA;">
    <th style="text-align:left;padding:8px;">Day</th>
    <th style="text-align:left;padding:8px;">Meal 1</th>
    ${isTwoMeals ? `<th style="text-align:left;padding:8px;">Meal 2</th>` : ``}
  </tr>`
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>${head}</thead>
    <tbody>${rows}</tbody>
  </table>`
}

export default function AdminSubscriptionsPage() {
  const { subs, add, remove } = useSubscriptions()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return subs.filter(x => {
      const hay = `${x.id} ${x.planId} ${x.userPhone} ${x.userEmail ?? ''} ${x.address}`.toLowerCase()
      return !s || hay.includes(s)
    })
  }, [subs, q])

  function printPlanBill(s: Subscription) {
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

      const planTitle = s.planId.replace('-', ' • ')
      const win1 = s.windows[0] ? `${s.windows[0]!.sh}:${s.windows[0]!.sm} ${s.windows[0]!.sap} – ${s.windows[0]!.eh}:${s.windows[0]!.em} ${s.windows[0]!.eap}` : '—'
      const win2 = s.isTwoMeals && s.windows[1]
        ? `${s.windows[1]!.sh}:${s.windows[1]!.sm} ${s.windows[1]!.sap} – ${s.windows[1]!.eh}:${s.windows[1]!.em} ${s.windows[1]!.eap}`
        : null

      const weeks = s.isMonthly ? 4 : 1
      const slotsPerDay = s.isTwoMeals ? 2 : 1
      const menuHTML = menuTableHTML(s.weekMenu || [], s.isTwoMeals)

      const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Plan Invoice ${s.id}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  @media print { .no-print { display:none!important } }
  body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; color:#333; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 24px; }
  .muted { color:#6b6b6b; }
  .h1 { font-size: 22px; margin: 0; }
  .chip { display:inline-block; padding:4px 8px; border-radius:12px; border:1px solid #cbb; background:#F1E7DA; }
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
        <div class="chip">PLAN SUBSCRIPTION</div>
        <div class="muted" style="font-size:12px;">${new Date(s.createdAt).toLocaleString()}</div>
      </div>
    </div>

    <div style="margin-top:12px;">
      <div><strong>Invoice #</strong> ${s.id}</div>
      <div><strong>Plan</strong> ${planTitle}</div>
      <div><strong>Weeks</strong> ${weeks} • <strong>Slots/day</strong> ${slotsPerDay}</div>
      <div><strong>Amount</strong> ${money(s.total)} <span class="muted">(Paid online)</span></div>
      <div><strong>Start From</strong> ${s.startFrom}</div>
    </div>

    <div class="divider"></div>

    <div style="display:flex; gap:24px; flex-wrap:wrap;">
      <div style="min-width:260px;">
        <div style="font-weight:600; margin-bottom:6px;">Subscriber</div>
        <div><strong>Phone:</strong> ${s.userPhone}</div>
        <div><strong>Email:</strong> ${s.userEmail || '—'}</div>
        <div><strong>Address:</strong> ${s.address}</div>
      </div>
      <div style="min-width:260px;">
        <div style="font-weight:600; margin-bottom:6px;">Delivery Windows</div>
        <div><strong>Meal 1:</strong> ${win1}</div>
        ${win2 ? `<div><strong>Meal 2:</strong> ${win2}</div>` : ``}
      </div>
    </div>

    <div class="divider"></div>

    <div style="margin:8px 0 4px; font-weight:600;">Weekly Menu (Mon–Sat)</div>
    ${menuHTML}

    <div class="divider"></div>
    <div class="muted" style="font-size:12px;">Thank you! This is a demo invoice based on local storage.</div>

    <div style="margin-top:16px;">
      <button class="no-print" onclick="window.print()" style="padding:8px 12px; border-radius:10px; border:1px solid #bbb; background:#fff;">Print</button>
    </div>
  </div>

  <script> setTimeout(()=>{ try{ window.print() }catch(e){} }, 300); </script>
</body>
</html>
      `.trim()

      const w = window.open('', '_blank', 'width=980,height=820')
      if (!w) return alert('Popup blocked. Please allow popups to print.')
      w.document.open(); w.document.write(html); w.document.close(); w.focus()
    } catch (e) {
      console.error(e); alert('Unable to generate plan invoice.')
    }
  }

  // ---- Seed demo (weekly-2, monthly-1, monthly-2) ----
  function seedDemo() {
    const now = Date.now()
    const today = new Date()
    const y = today.getFullYear(), m = String(today.getMonth()+1).padStart(2,'0'), d = String(today.getDate()).padStart(2,'0')
    const startFrom = `${y}-${m}-${d}`

    const makeMenu = (twoMeals: boolean): ChoiceRow[] => {
      const veg = ['Daal + Roti','Sabzi + Roti','Chana + Roti','Mix Veg + Roti','Aloo Palak + Roti','Bhindi + Roti']
      const non = ['Chicken Curry + Roti','Qeema + Roti','Chicken Karahi + Roti','Biryani','Haleem','Chicken Handi + Naan']
      return DAYS.map((_, i) => {
        const m1 = i < 3 ? { cat: 'Veg' as const, 'dish': veg[i] } : { cat: 'Non-veg' as const, 'dish': non[i] }
        const m2 = twoMeals ? (i % 2 === 0 ? { cat: 'Non-veg' as const, dish: non[i] } : { cat: 'Veg' as const, dish: veg[i] }) : undefined
        return [m1, m2]
      })
    }

    const base = {
      createdAt: now,
      startFrom,
      address: 'Office #12, Gulberg, Lahore',
      userPhone: '+92-300-1234567',
      userEmail: 'customer@example.com',
      windows: [
        { sh:'11', sm:'00', sap:'AM', eh:'12', em:'00', eap:'PM' } as const,
        { sh:'07', sm:'00', sap:'PM', eh:'08', em:'00', eap:'PM' } as const,
      ] as any,
      deliveries: [],
    }

    const s1: Subscription = {
      id: `SUB-DEMO-${now}-W2`, planId:'weekly-2', isTwoMeals:true, isMonthly:false,
      total: 7600, weekMenu: makeMenu(true), ...base,
    } as any

    const s2: Subscription = {
      id: `SUB-DEMO-${now}-M1`, planId:'monthly-1', isTwoMeals:false, isMonthly:true,
      total: 15500, weekMenu: makeMenu(false), ...base,
    } as any

    const s3: Subscription = {
      id: `SUB-DEMO-${now}-M2`, planId:'monthly-2', isTwoMeals:true, isMonthly:true,
      total: 29500, weekMenu: makeMenu(true), ...base,
    } as any

    add(s1); add(s2); add(s3)
    alert('Seeded 3 subscriptions: weekly-2, monthly-1, monthly-2.')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">Subscriptions</h1>
          <p className="muted">All active plans & schedules</p>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="input md:col-span-2" placeholder="Search id / phone / email / address…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn btn-outline" onClick={seedDemo}>Seed demo</button>
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-sand/60">
            <tr>
              <th className="text-left px-4 py-3">Subscription</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">Windows</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-top border-taupe/30">
                <td className="px-4 py-3 align-top">
                  <div className="font-medium">{s.id}</div>
                  <div className="muted">{fmt(s.createdAt)}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div>{s.userPhone}</div>
                  <div className="muted text-xs">{s.userEmail || ''}</div>
                  <div className="muted text-xs truncate max-w-[260px]">{s.address}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  {s.planId.replace('-', ' • ')}<br/>
                  <span className="muted text-xs">{s.isMonthly ? 'Weeks: 4' : 'Weeks: 1'} • Slots/day: {s.isTwoMeals ? 2 : 1}</span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div>Meal 1: {s.windows[0] ? `${s.windows[0]!.sh}:${s.windows[0]!.sm} ${s.windows[0]!.sap} – ${s.windows[0]!.eh}:${s.windows[0]!.em} ${s.windows[0]!.eap}` : '—'}</div>
                  {s.isTwoMeals && s.windows[1] && <div>Meal 2: {`${s.windows[1]!.sh}:${s.windows[1]!.sm} ${s.windows[1]!.sap} – ${s.windows[1]!.eh}:${s.windows[1]!.em} ${s.windows[1]!.eap}`}</div>}
                </td>
                <td className="px-4 py-3 align-top"><div className="font-heading">{money(s.total)}</div></td>
                <td className="px-4 py-3 align-top">
                  <div className="flex gap-2 justify-end flex-wrap">
                    <button className="btn btn-primary" onClick={()=>printPlanBill(s)}>Print Plan Bill</button>
                    <button className="btn btn-outline" onClick={()=>remove(s.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center muted">No subscriptions match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
