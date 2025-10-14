'use client'

import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import { useEffect, useState } from 'react'
import { usePlanCatalog, type PlanKey } from '@/components/admin/usePlanCatalog'

const PLAN_LABEL: Record<PlanKey, string> = {
  'weekly-1': 'Weekly • 1 Meal',
  'weekly-2': 'Weekly • 2 Meals',
  'monthly-1': 'Monthly • 1 Meal',
  'monthly-2': 'Monthly • 2 Meals',
}

export default function AdminPlansCatalogPage() {
  const { cat, update, reset } = usePlanCatalog()
  const [local, setLocal] = useState(cat)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { setLocal(cat) }, [cat])

  const setPrice = (k: PlanKey, v: string) => {
    const n = Math.max(0, parseInt(v || '0', 10) || 0)
    setLocal(prev => ({ ...prev, prices: { ...prev.prices, [k]: n } }))
  }
  const setAvail = (k: PlanKey, val: boolean) => {
    setLocal(prev => ({ ...prev, availability: { ...prev.availability, [k]: val } }))
  }

  const saveAll = () => {
    update(local); setMsg('Saved! Plans updated.')
    setTimeout(()=>setMsg(null), 1200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">Admin Plans</h1>
          <p className="muted">Manage catalog: prices, rules, availability</p>
        </div>
      </div>

      <Card className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(local.prices) as PlanKey[]).map(k => (
            <div key={k} className="border border-taupe/30 rounded-xl p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-heading">{PLAN_LABEL[k]}</div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={local.availability[k]} onChange={e=>setAvail(k, e.target.checked)} />
                  <span>Available</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="label">Price (Rs)</label>
                <input className="input" value={local.prices[k]} onChange={e=>setPrice(k, e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-taupe/30 rounded-xl p-3">
            <label className="label">Included non-veg per week (1-meal base)</label>
            <input
              className="input"
              value={local.includedNonVegBase}
              onChange={e=>setLocal({...local, includedNonVegBase: Math.max(0, parseInt(e.target.value||'0',10) || 0)})}
            />
            <p className="muted text-sm mt-1">2-meals ⇒ ×2, Monthly ⇒ ×4</p>
          </div>
          <div className="border border-taupe/30 rounded-xl p-3">
            <label className="label">Surcharge per extra non-veg (Rs)</label>
            <input
              className="input"
              value={local.surchargePerExtraNonVeg}
              onChange={e=>setLocal({...local, surchargePerExtraNonVeg: Math.max(0, parseInt(e.target.value||'0',10) || 0)})}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={saveAll}>Save</button>
          <button className="btn btn-outline" onClick={reset}>Reset defaults</button>
        </div>
        {msg && <div className="chip">{msg}</div>}
      </Card>

      <Card>
        <p className="muted text-sm">
          Frontend <code className="px-1 py-0.5 bg-sand rounded">/plans</code> grid ko catalog se bind karna ho to next step me
          Plans page me in values ko read kar lenge (currently static). Batana agar abhi kara doon.
        </p>
      </Card>
    </div>
  )
}
