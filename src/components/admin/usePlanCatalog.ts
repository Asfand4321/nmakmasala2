'use client'

import { useEffect, useState } from 'react'

export type PlanKey = 'weekly-1' | 'weekly-2' | 'monthly-1' | 'monthly-2'
export type Catalog = {
  prices: Record<PlanKey, number>
  includedNonVegBase: number
  surchargePerExtraNonVeg: number
  availability: Record<PlanKey, boolean>
}

const KEY = 'nm_plan_catalog'

const DEFAULTS: Catalog = {
  prices: {
    'weekly-1': 4000,
    'weekly-2': 7600,
    'monthly-1': 15500,
    'monthly-2': 29500,
  },
  includedNonVegBase: 3,
  surchargePerExtraNonVeg: 50,
  availability: {
    'weekly-1': true,
    'weekly-2': true,
    'monthly-1': true,
    'monthly-2': true,
  }
}

function load(): Catalog {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) as Catalog } catch {}
  return DEFAULTS
}
function save(c: Catalog) { try { localStorage.setItem(KEY, JSON.stringify(c)) } catch {} }

export function usePlanCatalog() {
  const [cat, setCat] = useState<Catalog>(DEFAULTS)
  useEffect(() => { setCat(load()) }, [])
  const update = (next: Catalog) => { setCat(next); save(next) }
  const reset = () => update(DEFAULTS)
  return { cat, update, reset, DEFAULTS }
}
