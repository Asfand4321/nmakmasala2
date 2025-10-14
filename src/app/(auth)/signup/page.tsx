'use client'
import Link from 'next/link'
import { useState } from 'react'
import AuthCard from '@/components/AuthCard'
import Button from '@/components/Button'

type Method = 'email' | 'phone'

export default function SignupPage() {
  const [method, setMethod] = useState<Method>('email')

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    console.log('SIGNUP', Object.fromEntries(data.entries()))
    alert('Demo only — backend wire-up later.')
  }

  return (
    <div className="container-nm max-w-xl">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMethod('email')}
          className={`chip ${method === 'email' ? 'ring-2 ring-olive/50' : ''}`}
        >
          Email
        </button>
        <button
          onClick={() => setMethod('phone')}
          className={`chip ${method === 'phone' ? 'ring-2 ring-olive/50' : ''}`}
        >
          Phone
        </button>
      </div>

      <AuthCard
        title="Create account"
        subtitle="Sign up with email or phone. Add referral (optional)."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" className="input" required placeholder="e.g. Ali Khan" />

          {method === 'email' ? (
            <>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="input" placeholder="Create a strong password" />
            </>
          ) : (
            <>
              <label className="label" htmlFor="phone">Phone</label>
              <input
                id="phone" name="phone" type="tel"
                pattern="^\+?\d{10,15}$" title="Enter a valid phone e.g. +92XXXXXXXXXX"
                required className="input" placeholder="+92XXXXXXXXXX"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => alert('Send OTP (demo)')}>
                  Send OTP
                </Button>
                <input name="otp" className="input" placeholder="Enter OTP" />
              </div>
            </>
          )}

          {/* Referral */}
          <label className="label" htmlFor="referral">Referral code (optional)</label>
          <input id="referral" name="referral" className="input" placeholder="ABC123" />

          <Button type="submit" className="w-full">Sign up</Button>

          <p className="text-sm muted">
            Already have an account? <Link className="underline" href="/(auth)/login">Login</Link>
          </p>
        </form>
      </AuthCard>
    </div>
  )
}
