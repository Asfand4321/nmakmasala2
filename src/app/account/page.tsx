'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/Card'
import Illustration from '@/components/Illustration'

function readStr(key: string, fallback = '') {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}
function readNum(key: string, fallback = 0) {
  try { return Number(localStorage.getItem(key) ?? fallback) } catch { return fallback }
}
function write(key: string, value: string | number) {
  try { localStorage.setItem(key, String(value)) } catch {}
}

export default function AccountPage() {
  // Profile
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  // Payment
  const [payMethod, setPayMethod] = useState<'cod' | 'card'>('cod')
  const [wallet, setWallet] = useState(0)
  const [topup, setTopup] = useState('')

  // Referral
  const [ref, setRef] = useState('')

  // Load once
  useEffect(() => {
    setName(readStr('nm_user_name'))
    setEmail(readStr('nm_user_email'))
    setPhone(readStr('nm_user_phone'))
    setPayMethod((readStr('nm_pay_method', 'cod') as 'cod' | 'card') || 'cod')
    setWallet(readNum('nm_wallet', 0))
    const existing = readStr('nm_ref_code')
    if (existing) setRef(existing)
    else {
      const last = (readStr('nm_user_phone').replace(/\D/g, '').slice(-4) || Math.floor(1000 + Math.random()*9000).toString())
      const code = `NM-${last}-${Math.random().toString(36).slice(2,6).toUpperCase()}`
      setRef(code)
      write('nm_ref_code', code)
    }
  }, [])

  const validPhone = useMemo(() => {
    const d = phone.replace(/\D/g, '')
    return d.length >= 10 && d.length <= 15
  }, [phone])

  const saveProfile = () => {
    write('nm_user_name', name.trim())
    write('nm_user_email', email.trim())
    if (validPhone) write('nm_user_phone', phone.trim())
    write('nm_pay_method', payMethod)
    setSavedMsg('Saved ✓')
    setTimeout(() => setSavedMsg(null), 1200)
  }

  const doTopup = () => {
    const n = parseInt(topup, 10)
    if (!Number.isFinite(n) || n <= 0) {
      alert('Enter a valid amount')
      return
    }
    const next = wallet + n
    setWallet(next)
    write('nm_wallet', next)
    setTopup('')
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Illustration variant="user" size={64} />
        <div>
          <h1 className="h1 m-0">Account</h1>
          <p className="muted">Manage profile, payment & referrals</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile */}
        <Card className="p-4 space-y-3 lg:col-span-2">
          <div className="font-heading text-lg">Profile</div>

          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@email.com" />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              placeholder="+92XXXXXXXXXX or 03XXXXXXXXX"
            />
            {!validPhone && phone && <p className="text-sm text-terracotta mt-1">Please enter a valid number.</p>}
            {validPhone && <p className="text-sm text-olive mt-1">This number is used at checkout.</p>}
          </div>

          <div>
            <label className="label">Default payment method</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={()=>setPayMethod('cod')}
                className={`chip ${payMethod==='cod' ? 'ring-2 ring-olive/50' : ''}`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                onClick={()=>setPayMethod('card')}
                className={`chip ${payMethod==='card' ? 'ring-2 ring-olive/50' : ''}`}
              >
                Card
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button className="btn btn-primary" onClick={saveProfile} disabled={!!savedMsg || (!!phone && !validPhone)}>
              Save changes
            </button>
            {savedMsg && <span className="chip ml-2">{savedMsg}</span>}
          </div>
        </Card>

        {/* Wallet / Top-up */}
        <Card className="p-4 space-y-3">
          <div className="font-heading text-lg">Wallet</div>
          <div className="text-2xl font-heading">Rs {wallet}</div>
          <div>
            <label className="label">Add funds</label>
            <div className="flex gap-2">
              <input className="input w-full" value={topup} onChange={(e)=>setTopup(e.target.value)} placeholder="e.g. 500" />
              <button className="btn btn-outline" onClick={doTopup}>Top up</button>
            </div>
            <p className="muted text-sm mt-1">Demo wallet — amounts are stored locally.</p>
          </div>
        </Card>

        {/* Referral */}
        <Card className="p-4 space-y-3">
          <div className="font-heading text-lg">Referral</div>
          <div className="muted text-sm">Invite friends & get credits</div>
          <div className="flex items-center gap-2">
            <input className="input" readOnly value={ref} />
            <button
              className="btn btn-outline"
              onClick={() => { navigator.clipboard?.writeText(ref); }}
            >
              Copy
            </button>
          </div>
          <p className="muted text-sm">Share your code at signup to apply benefits.</p>
        </Card>
      </div>
    </div>
  )
}
