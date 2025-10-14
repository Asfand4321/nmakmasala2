'use client'

import { useEffect, useMemo, useState } from 'react'

export type MethodKind = 'online' | 'cod'
export type PaymentStatus = 'paid' | 'cod_pending'
export type RefType = 'plan' | 'meal'

export type PaymentMethod = {
  id: string
  name: string
  kind: MethodKind
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export type Payment = {
  id: string
  refType: RefType           // plan | meal
  refId: string              // SUB-... or ORD-...
  amount: number
  methodName: string
  methodKind: MethodKind
  status: PaymentStatus      // 'paid' (online) | 'cod_pending' (COD)
  phone?: string
  email?: string
  createdAt: number
}

const MKEY = 'nm_payment_methods'
const PKEY = 'nm_payments'

function uid(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}` }

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function save<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }

export function usePayments() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    const m = load<PaymentMethod[]>(MKEY, [])
    if (!m.length) {
      const seed: PaymentMethod[] = [
        { id: uid('PM'), name: 'Card (Demo)',   kind: 'online', enabled: true,  createdAt: Date.now(), updatedAt: Date.now() },
        { id: uid('PM'), name: 'JazzCash',      kind: 'online', enabled: true,  createdAt: Date.now(), updatedAt: Date.now() },
        { id: uid('PM'), name: 'EasyPaisa',     kind: 'online', enabled: false, createdAt: Date.now(), updatedAt: Date.now() },
        { id: uid('PM'), name: 'Cash on Delivery', kind: 'cod', enabled: true,  createdAt: Date.now(), updatedAt: Date.now() },
      ]
      setMethods(seed); save(MKEY, seed)
    } else {
      setMethods(m)
    }
    setPayments(load<Payment[]>(PKEY, []))
  }, [])

  const onlineMethods = useMemo(() => methods.filter(m => m.kind === 'online' && m.enabled), [methods])
  const codEnabled   = useMemo(() => methods.some(m => m.kind === 'cod' && m.enabled), [methods])

  function addMethod(name: string, kind: MethodKind) {
    const rec: PaymentMethod = { id: uid('PM'), name, kind, enabled: true, createdAt: Date.now(), updatedAt: Date.now() }
    const next = [rec, ...methods]; setMethods(next); save(MKEY, next)
  }
  function updateMethod(id: string, patch: Partial<PaymentMethod>) {
    const next = methods.map(m => m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m)
    setMethods(next); save(MKEY, next)
  }
  function removeMethod(id: string) {
    const next = methods.filter(m => m.id !== id)
    setMethods(next); save(MKEY, next)
  }

  function addPayment(p: Omit<Payment, 'id'|'createdAt'>) {
    const rec: Payment = { id: uid('PAY'), createdAt: Date.now(), ...p }
    const next = [rec, ...payments]; setPayments(next); save(PKEY, next)
  }

  return {
    methods, onlineMethods, codEnabled,
    payments,
    addMethod, updateMethod, removeMethod,
    addPayment
  }
}
