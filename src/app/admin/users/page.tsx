'use client'

import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import { useState } from 'react'
import { useChildAccounts, type AdminUser, type Permissions } from '@/components/admin/useChildAccounts'
import { useAdminAuth } from '@/components/admin/auth'
import { hasPerm } from '@/components/admin/perm'

const AREAS: Array<{key: keyof Permissions; label: string; actions: Array<keyof NonNullable<Permissions[keyof Permissions]>>}> = [
  { key:'meals', label:'Meals', actions:['view','create','edit','delete'] },
  { key:'orders', label:'Orders (Meals)', actions:['view','edit','print'] },
  { key:'subscriptions', label:'Subscriptions (Plans)', actions:['view','edit','print'] },
  { key:'deliveries', label:'Deliveries', actions:['view','edit'] },
  { key:'payments', label:'Payments', actions:['view','refund'] },
  { key:'settings', label:'Settings', actions:['view','edit'] },
  { key:'menu', label:'Menu Planner', actions:['view','edit'] },
  { key:'customers', label:'Customers', actions:['view'] },
  { key:'support', label:'Support', actions:['view','edit'] },
  { key:'reports', label:'Reports', actions:['view'] },
]

function emptyPerms(): Permissions {
  const out: any = {}
  for (const a of AREAS) {
    out[a.key] = {}
    for (const act of a.actions) out[a.key][act] = false
  }
  return out as Permissions
}

export default function AdminUsersPage() {
  const { users, add, update, remove, toggleEnabled, seedManager } = useChildAccounts()
  const { current, setCurrentId } = useAdminAuth()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [perms, setPerms] = useState<Permissions>(emptyPerms())

  const canManage = hasPerm(current, 'settings.edit') || (current?.role === 'owner')

  const createUser = () => {
    if (!canManage) return alert('Not allowed.')
    if (!name.trim()) return alert('Name required')
    const u = add({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      role: 'manager',
      permissions: perms
    })
    setName(''); setEmail(''); setPhone(''); setPerms(emptyPerms()); setFormOpen(false)
    alert(`Manager created: ${u.name}`)
  }

  const toggle = (uid: string, area: keyof Permissions, action: string) => {
    const u = users.find(x=>x.id===uid); if (!u) return
    if (!canManage) return alert('Not allowed.')
    const next = { ...u.permissions } as any
    next[area] = { ...(next[area]||{}) }
    next[area][action] = !next[area][action]
    update(uid, { permissions: next })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="card" size={56} />
        <div>
          <h1 className="h1 m-0">Child Accounts</h1>
          <p className="muted">Create managers and limit their access</p>
        </div>
      </div>

      {/* Current admin switcher */}
      <Card className="space-y-3">
        <div className="font-heading">You are signed in as</div>
        <div className="flex flex-wrap gap-2">
          {users.map(u=>(
            <button
              key={u.id}
              onClick={()=>setCurrentId(u.id)}
              className={`chip ${current?.id===u.id ? 'ring-2 ring-olive/50' : ''}`}
              title={u.email || u.phone || ''}
            >
              {u.name} • {u.role}{u.enabled ? '' : ' (disabled)'}
            </button>
          ))}
        </div>
        <p className="muted text-sm">Use this switch to impersonate a manager and test UI restrictions.</p>
      </Card>

      {/* Create manager */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-heading">Add manager</div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={()=>seedManager()}>Seed demo manager</button>
            <button className="btn btn-primary" onClick={()=>setFormOpen(!formOpen)}>{formOpen?'Close':'New manager'}</button>
          </div>
        </div>

        {formOpen && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
              <input className="input" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
              <input className="input" placeholder="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)} />
            </div>

            <div className="border border-taupe/30 rounded-xl overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-sand/60">
                  <tr>
                    <th className="text-left px-3 py-2">Area</th>
                    <th className="text-left px-3 py-2">Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {AREAS.map(a=>(
                    <tr key={a.key} className="border-t border-taupe/20">
                      <td className="px-3 py-2 font-medium">{a.label}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-3">
                          {a.actions.map(act=>{
                            const val = (perms as any)[a.key]?.[act] || false
                            return (
                              <label key={String(act)} className="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={val}
                                  onChange={()=>{
                                    const next: any = { ...perms }
                                    next[a.key] = { ...(next[a.key]||{}) }
                                    next[a.key][act] = !val
                                    setPerms(next)
                                  }}
                                />
                                <span>{String(act)}</span>
                              </label>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={createUser} disabled={!canManage}>Create</button>
            </div>
          </div>
        )}
      </Card>

      {/* List */}
      <Card className="p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-sand/60">
            <tr>
              <th className="text-left px-3 py-2">User</th>
              <th className="text-left px-3 py-2">Contact</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Permissions</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className="border-t border-taupe/20">
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2">
                  <div className="muted">{u.email || '—'}</div>
                  <div className="muted">{u.phone || ''}</div>
                </td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">
                  <span className={`chip ${u.enabled ? '' : 'bg-terracotta text-white border-terracotta'}`}>
                    {u.enabled ? 'enabled' : 'disabled'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-2">
                    {AREAS.map(a=>(
                      <div key={a.key} className="flex items-center gap-2 flex-wrap">
                        <span className="w-36 text-xs font-medium">{a.label}</span>
                        {a.actions.map(act=>{
                          const val = (u.permissions as any)?.[a.key]?.[act] || false
                          return (
                            <label key={String(act)} className="inline-flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={val}
                                onChange={()=>toggle(u.id, a.key, String(act))}
                                disabled={!canManage || u.role==='owner'}
                              />
                              <span>{String(act)}</span>
                            </label>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-2 justify-end">
                    {u.role!=='owner' && (
                      <>
                        <button className="btn btn-outline" onClick={()=>toggleEnabled(u.id, !u.enabled)}>
                          {u.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-outline" onClick={()=>remove(u.id)}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center muted">No users</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
