'use client'

import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import { useEffect, useState } from 'react'
import { useSettings } from '@/components/admin/useSettings'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const { settings, save } = useSettings()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    setName(settings.name)
    setPhone(settings.phone)
    setAddress(settings.address)
  }, [settings])

  const onSave = () => {
    const next = {
      name: name.trim() || 'Namak Masaala',
      phone: phone.trim() || '+92-3XXXXXXXXX',
      address: address.trim() || 'Lahore, Pakistan',
    }
    save(next)
    setMsg('Saved! Invoices will use this info.')
    setTimeout(() => setMsg(null), 1200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">Settings</h1>
          <p className="muted">Business info for invoices & admin</p>
        </div>
      </div>

      <Card className="space-y-4">
        <div>
          <label className="label">Business name</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Namak Masaala" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+92-3XXXXXXXXX" />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="City, Country" />
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={onSave}>Save</button>
          <Link href="/admin/payments" className="btn btn-outline">Payment methods →</Link>
        </div>
        {msg && <div className="chip">{msg}</div>}
      </Card>

      <Card>
        <p className="muted text-sm">
          Tip: Logo is read from <code className="px-1 py-0.5 bg-sand rounded">/public/logo.png</code>.  
          Change it via file replace.
        </p>
      </Card>
    </div>
  )
}
