'use client'

import { useEffect, useMemo, useState } from 'react'

export type Win = {
  sh: string; sm: string; sap: 'AM' | 'PM';
  eh: string; em: string; eap: 'AM' | 'PM';
}

export type DeliveryStatus = 'pending' | 'delivered' | 'skipped'
export type DeliveryEntry = { date: string; slot: 1|2; code: string; status: DeliveryStatus }

export type Choice = { cat: 'Veg' | 'Non-veg'; dish: string }
export type ChoiceRow = [Choice, Choice?]  // [meal1, meal2?]

export type Subscription = {
  id: string
  createdAt: number
  planId: string             // weekly-1 | weekly-2 | monthly-1 | monthly-2
  isTwoMeals: boolean
  isMonthly: boolean
  startFrom: string          // yyyy-mm-dd
  address: string
  windows: [Win, Win | null]
  userPhone: string
  userEmail?: string
  total: number
  deliveries: DeliveryEntry[]
  weekMenu: ChoiceRow[]      // 👈 Mon..Sat menu stored
}

const KEY = 'nm_subscriptions'

function load(): Subscription[] {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) as Subscription[] : [] } catch { return [] }
}
function save(list: Subscription[]) { try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {} }

export function useSubscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([])
  useEffect(() => { setSubs(load()) }, [])

  const byId = useMemo(() => {
    const m = new Map<string, Subscription>(); subs.forEach(s => m.set(s.id, s)); return m
  }, [subs])

  function add(s: Subscription) {
    const next = [s, ...subs]; setSubs(next); save(next)
  }
  function update(id: string, patch: Partial<Subscription>) {
    const next = subs.map(s => s.id === id ? { ...s, ...patch } as Subscription : s)
    setSubs(next); save(next)
  }
  function setDeliveryStatus(id: string, date: string, slot: 1|2, status: DeliveryStatus) {
    const next = subs.map(s => {
      if (s.id !== id) return s
      const deliveries = s.deliveries.map(d => (d.date===date && d.slot===slot) ? { ...d, status } : d)
      return { ...s, deliveries }
    })
    setSubs(next); save(next)
  }
  function remove(id: string) {
    const next = subs.filter(s => s.id !== id)
    setSubs(next); save(next)
  }

  return { subs, byId, add, update, setDeliveryStatus, remove }
}
