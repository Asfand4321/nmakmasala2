'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin',              label: 'Dashboard',     icon: '📊' },
  { href: '/admin/orders',       label: 'Orders',        icon: '🍽️' },
  { href: '/admin/meals',        label: 'Meals',         icon: '🍲' },
  { href: '/admin/plans',        label: 'Plans',         icon: '🗓️' },
  { href: '/admin/subscriptions',label: 'Subscriptions', icon: '🧾' },
  { href: '/admin/deliveries',   label: 'Deliveries',    icon: '🚚' },
  { href: '/admin/users',        label: 'Users',         icon: '👥' },
  { href: '/admin/payments',     label: 'Payments',      icon: '💳' },  // 👈 NEW
  { href: '/admin/settings',     label: 'Settings',      icon: '⚙️' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="container-nm py-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="font-heading text-2xl">Admin Panel</div>
          <Link href="/" className="btn btn-outline">← Back to site</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <aside className="card p-3 h-max sticky top-24">
          <nav className="flex md:flex-col gap-2 overflow-auto">
            {links.map(l => {
              const active = pathname === l.href
              return (
                <Link key={l.href} href={l.href}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-2 ${active ? 'bg-sand text-charcoal shadow-soft' : 'hover:bg-sand/70'}`}>
                  <span aria-hidden>{l.icon}</span>
                  <span className="whitespace-nowrap">{l.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  )
}
