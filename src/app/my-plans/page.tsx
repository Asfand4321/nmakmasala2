'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import Link from 'next/link'
import type { Subscription } from '@/components/admin/useSubscriptions'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function ymd(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function dateLabel(s: string) {
  const d = new Date(s + 'T00:00:00')
  return `${DAYS[d.getDay()]} • ${d.toLocaleDateString()}`
}
function winLabel(w: any) {
  if (!w) return '—'
  return `${w.sh}:${w.sm} ${w.sap} – ${w.eh}:${w.em} ${w.eap}`
}
function loadUserSubs(): Subscription[] {
  try {
    // Checkout ke time pe yeh key set ho rahi hoti hai
    return JSON.parse(localStorage.getItem('nm_user_plans') || '[]') as Subscription[]
  } catch {
    return []
  }
}

export default function MyPlansPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [showCodes, setShowCodes] = useState(false)

  useEffect(() => {
    setSubs(loadUserSubs())
  }, [])

  // Recent first + next upcoming info
  const enriched = useMemo(() => {
    const today = ymd()
    return subs
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((s) => {
        const nextDrop = s.deliveries.find((d) => d.date >= today && d.status !== 'delivered')
        return { s, nextDrop }
      })
  }, [subs])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">My Plans</h1>
          <p className="muted">Your active subscriptions and upcoming deliveries</p>
        </div>
      </div>

      {enriched.length === 0 && (
        <Card className="text-center space-y-3">
          <p className="muted">No subscriptions yet.</p>
          <Link href="/plans" className="btn btn-primary">Browse Plans</Link>
        </Card>
      )}

      {enriched.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="muted text-sm">Toggle to reveal delivery codes (for rider)</div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCodes}
              onChange={(e) => setShowCodes(e.target.checked)}
            />
            <span>Show codes</span>
          </label>
        </div>
      )}

      {enriched.map(({ s, nextDrop }) => (
        <Card key={s.id} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-heading text-lg">{s.planId.replace('-', ' • ')}</div>
              <div className="muted text-sm">
                {s.isMonthly ? 'Weeks: 4' : 'Weeks: 1'} • Slots/day: {s.isTwoMeals ? 2 : 1}
              </div>
            </div>
            <div className="font-heading">Rs {s.total}</div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="label">Address</div>
              <div>{s.address}</div>
            </div>
            <div>
              <div className="label">Meal 1 window</div>
              <div>{winLabel(s.windows[0])}</div>
            </div>
            {s.isTwoMeals && (
              <div>
                <div className="label">Meal 2 window</div>
                <div>{winLabel(s.windows[1])}</div>
              </div>
            )}
          </div>

          {/* Upcoming deliveries */}
          <div className="border border-taupe/30 rounded-xl overflow-hidden">
            <div className="bg-sand/60 px-3 py-2 text-sm font-medium">Upcoming deliveries</div>
            <div className="divide-y divide-taupe/20">
              {s.deliveries.slice(0, 10).map((d) => (
                <div
                  key={`${d.date}-${d.slot}`}
                  className="px-3 py-2 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {dateLabel(d.date)} • Meal {d.slot}
                    </div>
                    {showCodes && <div className="muted text-xs">Code: {d.code}</div>}
                  </div>
                  <span
                    className={`chip capitalize ${
                      d.status === 'delivered' ? 'bg-olive text-white border-olive' : ''
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions (NO PRINT for user) */}
          <div className="flex gap-2 flex-wrap">
            <Link href="/plans" className="btn btn-outline">Change plan</Link>
            <span className="muted text-sm">Invoices are issued by admin.</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
