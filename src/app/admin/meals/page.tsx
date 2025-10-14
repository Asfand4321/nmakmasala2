'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAdminMeals, AdminMeal, MealType } from '@/components/admin/useAdminMeals'
import Card from '@/components/Card'
import Illustration from '@/components/Illustration'
import Modal from '@/components/admin/Modal'

type StatusFilter = 'All' | 'Active' | 'Inactive'
type TypeFilter = 'All' | MealType

const PLACEHOLDER = '/meal-placeholder.svg'

export default function AdminMealsPage() {
  const { meals, add, update, remove, seedIfEmpty } = useAdminMeals()

  // filters/search
  const [q, setQ] = useState('')
  const [typeF, setTypeF] = useState<TypeFilter>('All')
  const [statusF, setStatusF] = useState<StatusFilter>('All')

  // modal state (add/edit)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminMeal | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<MealType>('Veg')
  const [price, setPrice] = useState('250')
  const [active, setActive] = useState(true)
  const [image, setImage] = useState('')        // URL or dataURL
  const [description, setDescription] = useState('')   // 👈 NEW
  const [labelsText, setLabelsText] = useState('')     // 👈 NEW (comma-separated)

  useEffect(() => { if (!meals.length) seedIfEmpty() }, [meals.length, seedIfEmpty])

  const filtered = useMemo(() => {
    return meals.filter(m => {
      const s = `${m.name} ${m.description ?? ''}`.toLowerCase().includes(q.toLowerCase().trim())
      const t = typeF === 'All' ? true : m.type === typeF
      const a = statusF === 'All' ? true : (statusF === 'Active' ? m.active : !m.active)
      return s && t && a
    })
  }, [meals, q, typeF, statusF])

  function openAdd() {
    setEditing(null); setName(''); setType('Veg'); setPrice('250'); setActive(true);
    setImage(''); setDescription(''); setLabelsText(''); setOpen(true)
  }
  function openEdit(m: AdminMeal) {
    setEditing(m); setName(m.name); setType(m.type); setPrice(String(m.price)); setActive(m.active);
    setImage(m.image || ''); setDescription(m.description || ''); setLabelsText((m.labels || []).join(', ')); setOpen(true)
  }
  function onSave() {
    const p = parseInt(price, 10)
    if (!name.trim() || !Number.isFinite(p) || p <= 0) {
      alert('Please enter a valid name and price.')
      return
    }
    const img = image || editing?.image || PLACEHOLDER
    const labels = labelsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (editing) {
      update(editing.id, { name: name.trim(), type, price: p, active, image: img, description: description.trim(), labels })
    } else {
      add({ name: name.trim(), type, price: p, active, featured: false, image: img, description: description.trim(), labels })
    }
    setOpen(false)
  }
  function onDelete(id: string) {
    if (confirm('Delete this meal?')) remove(id)
  }
  function toggleActive(m: AdminMeal) {
    update(m.id, { active: !m.active })
  }
  function onFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="tray" size={56} />
        <div>
          <h1 className="h1 m-0">Meals</h1>
          <p className="muted">Create, edit, enable/disable meals shown on storefront</p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="input md:col-span-2" placeholder="Search meals…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="input" value={typeF} onChange={(e)=>setTypeF(e.target.value as TypeFilter)}>
            <option>All</option><option>Veg</option><option>Non-veg</option>
          </select>
          <select className="input" value={statusF} onChange={(e)=>setStatusF(e.target.value as StatusFilter)}>
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn btn-primary" onClick={openAdd}>Add meal</button>
          <button className="btn btn-outline" onClick={seedIfEmpty}>Seed sample</button>
        </div>
      </Card>

      {/* List with thumbnails + description + labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(m => (
          <Card key={m.id} className="p-4 space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={m.image || PLACEHOLDER}
                alt={m.name}
                className="w-14 h-14 rounded-xl object-cover bg-sand border border-taupe/40"
              />
              <div className="min-w-0">
                <div className="font-heading text-lg truncate">{m.name}</div>
                <div className="muted text-sm">Type: {m.type} • Price: Rs {m.price}</div>
              </div>
              <span className={`chip ml-auto ${m.active ? '' : 'opacity-70'}`}>{m.active ? 'Active' : 'Inactive'}</span>
            </div>

            {m.description && <div className="muted text-sm">{m.description}</div>}

            {m.labels && m.labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {m.labels.map((lb, i) => (
                  <span key={i} className="chip bg-olive text-white border-olive">{lb}</span>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button className="btn btn-outline" onClick={()=>openEdit(m)}>Edit</button>
              <button className="btn btn-outline" onClick={()=>toggleActive(m)}>{m.active ? 'Disable' : 'Enable'}</button>
              <button className="btn btn-outline" onClick={()=>onDelete(m.id)}>Delete</button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-6 text-center">
            <div className="muted">No meals match your filters.</div>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal — URL, upload, description, labels */}
      <Modal open={open} title={editing ? 'Edit meal' : 'Add meal'} onClose={()=>setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Biryani" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Type</label>
              <select className="input" value={type} onChange={(e)=>setType(e.target.value as MealType)}>
                <option>Veg</option>
                <option>Non-veg</option>
              </select>
            </div>
            <div>
              <label className="label">Price (Rs)</label>
              <input className="input" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="e.g. 420" />
            </div>
          </div>

          <div>
            <label className="label">Image URL (optional)</label>
            <input className="input" value={image} onChange={(e)=>setImage(e.target.value)} placeholder="/meals/biryani.jpg or https://…" />
          </div>
          <div>
            <label className="label">Upload image</label>
            <input type="file" accept="image/*" onChange={(e)=>{ const f = e.target.files?.[0]; if (f) {
              const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.readAsDataURL(f);
            }}} />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input h-24" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Short tasty description…" />
          </div>

          <div>
            <label className="label">Labels / Badges (comma-separated)</label>
            <input className="input" value={labelsText} onChange={(e)=>setLabelsText(e.target.value)} placeholder="e.g. Salad free, 2 Roti free" />
            <div className="mt-2 flex flex-wrap gap-2">
              {labelsText.split(',').map(s => s.trim()).filter(Boolean).map((x,i)=>(
                <span key={i} className="chip bg-olive text-white border-olive">{x}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input id="active" type="checkbox" checked={active} onChange={(e)=>setActive(e.target.checked)} />
            <label htmlFor="active" className="select-none">Show on storefront</label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-outline" onClick={()=>setOpen(false)}>Close</button>
            <button className="btn btn-primary" onClick={onSave}>{editing ? 'Save changes' : 'Create meal'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
