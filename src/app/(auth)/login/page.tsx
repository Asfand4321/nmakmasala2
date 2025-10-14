'use client'
import Link from 'next/link'
import { useState } from 'react'
import AuthCard from '@/components/AuthCard'
import Button from '@/components/Button'

type Method = 'email' | 'phone'

export default function LoginPage() {
  const [method, setMethod] = useState<Method>('email')

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    console.log('LOGIN', Object.fromEntries(data.entries()))
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
        title="Login"
        subtitle={method === 'email' ? 'Use your email & password' : 'Use your phone number'}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {method === 'email' ? (
            <>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
            </>
          ) : (
            <>
              <label className="label" htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                pattern="^\+?\d{10,15}$"
                title="Enter a valid phone e.g. +92XXXXXXXXXX"
                required
                className="input"
                placeholder="+92XXXXXXXXXX"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => alert('Send OTP (demo)')}>
                  Send OTP
                </Button>
                <input name="otp" className="input" placeholder="Enter OTP" />
              </div>
            </>
          )}

          <Button type="submit" className="w-full">Login</Button>

          <p className="text-sm muted">
            New here? <Link className="underline" href="/(auth)/signup">Create an account</Link>
          </p>
        </form>
      </AuthCard>
    </div>
  )
}
