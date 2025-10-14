'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/components/CartProvider'

function CartBadge() {
  const { items } = useCart()
  const count = items.reduce((s, it) => s + (it.qty ?? 1), 0)
  if (count <= 0) return null
  return (
    <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs bg-olive text-white">
      {count}
    </span>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-taupe/40 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="container-nm h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 overflow-hidden rounded-lg">
            <Image src="/logo.png" alt="Namak Masaala" fill sizes="32px" className="object-cover" />
          </div>
          <span className="font-heading text-xl leading-none">Namak Masaala</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/plans" className="hover:opacity-80">Plans</Link>
          <Link href="/meals" className="hover:opacity-80">Meals</Link>
          <Link href="/dashboard" className="hover:opacity-80">Dashboard</Link>
          <Link href="/orders" className="hover:opacity-80">My Orders</Link>
          <Link href="/my-plans" className="hover:opacity-80">My Plans</Link>
          <Link href="/account" className="hover:opacity-80">Account</Link>
          <Link href="/customer-care" className="hover:opacity-80">Customer Care</Link>{/* ✅ added */}
          <Link href="/cart" className="hover:opacity-80 flex items-center">Cart <CartBadge /></Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/(auth)/login" className="btn btn-outline">Login</Link>
          <Link href="/(auth)/signup" className="btn btn-primary">Sign up</Link>
        </div>

        {/* Mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden btn btn-outline px-3 py-2"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-taupe/40">
          <div className="container-nm py-3 flex flex-col gap-3">
            <Link href="/plans" onClick={() => setOpen(false)}>Plans</Link>
            <Link href="/meals" onClick={() => setOpen(false)}>Meals</Link>
            <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link href="/orders" onClick={() => setOpen(false)}>My Orders</Link>
            <Link href="/my-plans" onClick={() => setOpen(false)}>My Plans</Link>
            <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
            <Link href="/customer-care" onClick={() => setOpen(false)}>Customer Care</Link>{/* ✅ added */}
            <Link href="/cart" className="flex items-center" onClick={() => setOpen(false)}>
              Cart <CartBadge />
            </Link>
            <div className="flex gap-2 pt-2">
              <Link href="/(auth)/login" className="btn btn-outline w-full" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/(auth)/signup" className="btn btn-primary w-full" onClick={() => setOpen(false)}>Sign up</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
