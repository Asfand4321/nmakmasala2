'use client'

import { useEffect, useState } from 'react'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type Ticket = {
  id: string
  createdAt: number
  status: TicketStatus
  subject: string
  message: string
  name?: string
  phone?: string
  email?: string
  orderId?: string // optional (for meals) or subscription id
}

const KEY = 'nm_support_tickets'

function load(): Ticket[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as Ticket[] : []
  } catch {
    return []
  }
}
function save(list: Ticket[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
}

export function useSupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => { setTickets(load()) }, [])

  function create(t: Omit<Ticket, 'id'|'createdAt'|'status'>) {
    const id = `SUP-${Date.now()}`
    const next: Ticket = { id, createdAt: Date.now(), status: 'open', ...t }
    const list = [next, ...tickets]
    setTickets(list); save(list)
    return next
  }

  function update(id: string, patch: Partial<Ticket>) {
    const list = tickets.map(t => t.id === id ? { ...t, ...patch } : t)
    setTickets(list); save(list)
  }

  function remove(id: string) {
    const list = tickets.filter(t => t.id !== id)
    setTickets(list); save(list)
  }

  return { tickets, create, update, remove }
}
