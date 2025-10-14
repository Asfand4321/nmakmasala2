'use client'

import { useState } from 'react'
import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import { useSupportTickets } from '@/components/support/useSupportTickets'

type FieldErr = Partial<Record<'name'|'phone'|'email'|'subject'|'message', string>>

export default function CustomerCarePage() {
  const { create } = useSupportTickets()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState(() => {
    try { return localStorage.getItem('nm_user_phone') || '' } catch { return '' }
  })
  const [email, setEmail] = useState('')
  const [orderId, setOrderId] = useState('') // optional: meal order (NM-...) or SUB-...
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sentId, setSentId] = useState<string | null>(null)
  const [errors, setErrors] = useState<FieldErr>({})

  const validate = (): boolean => {
    const e: FieldErr = {}
    if (!name.trim()) e.name = 'Required'
    if (!phone.trim()) e.phone = 'Required'
    if (!subject.trim()) e.subject = 'Required'
    if (!message.trim()) e.message = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    try { localStorage.setItem('nm_user_phone', phone.trim()) } catch {}
    const t = create({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      orderId: orderId.trim() || undefined,
    })
    setSentId(t.id)
    setName(''); setSubject(''); setMessage(''); setOrderId('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">Customer Care</h1>
          <p className="muted">We’re here to help with your meals & subscriptions</p>
        </div>
      </div>

      {/* Success toast */}
      {sentId && (
        <div className="chip">
          Ticket created: <span className="font-medium ml-1">{sentId}</span>. We’ll get back to you shortly.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Your name</label>
                <input className="input" value={name} onChange={e=>setName(e.target.value)} />
                {errors.name && <p className="text-terracotta text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="+92…" value={phone} onChange={e=>setPhone(e.target.value)} />
                {errors.phone && <p className="text-terracotta text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">Order/Plan ID (optional)</label>
                <input className="input" placeholder="e.g., NM-123… or SUB-…" value={orderId} onChange={e=>setOrderId(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Subject</label>
              <input className="input" value={subject} onChange={e=>setSubject(e.target.value)} />
              {errors.subject && <p className="text-terracotta text-sm mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="label">Message</label>
              <textarea className="input min-h-[140px]" value={message} onChange={e=>setMessage(e.target.value)} />
              {errors.message && <p className="text-terracotta text-sm mt-1">{errors.message}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <button type="reset" className="btn btn-outline" onClick={()=>{
                setName(''); setPhone(''); setEmail(''); setOrderId(''); setSubject(''); setMessage(''); setErrors({})
              }}>Clear</button>
              <button type="submit" className="btn btn-primary">Submit ticket</button>
            </div>
          </form>
        </Card>

        {/* FAQs */}
        <Card className="space-y-3">
          <div className="font-heading text-lg">FAQs</div>
          <details className="border border-taupe/30 rounded-xl p-3">
            <summary className="font-medium cursor-pointer">Delivery window kaise set hota hai?</summary>
            <p className="muted mt-2">Plans me Meal 1/2 ka time aap checkout par set kar sakte hain. Rider us window ke beech deliver karega.</p>
          </details>
          <details className="border border-taupe/30 rounded-xl p-3">
            <summary className="font-medium cursor-pointer">Meals (one-off) ka payment?</summary>
            <p className="muted mt-2">Meals par Cash on Delivery ya Card (advance) dono options milte hain.</p>
          </details>
          <details className="border border-taupe/30 rounded-xl p-3">
            <summary className="font-medium cursor-pointer">Plans ka payment?</summary>
            <p className="muted mt-2">Subscriptions advance online pay hoti hain. Invoice admin se issue hota hai.</p>
          </details>
          <details className="border border-taupe/30 rounded-xl p-3">
            <summary className="font-medium cursor-pointer">Order status/Tracking</summary>
            <p className="muted mt-2">Meals ke liye “My Orders”, plans ke liye “My Plans” page dekh sakte hain.</p>
          </details>
          <details className="border border-taupe/30 rounded-xl p-3">
            <summary className="font-medium cursor-pointer">Refunds / Cancellations</summary>
            <p className="muted mt-2">Meals cancel delivery se pehle possible. Plans me week start se pehle changes allowed (admin approval required).</p>
          </details>
        </Card>
      </div>
    </div>
  )
}

