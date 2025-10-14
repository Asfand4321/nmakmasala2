'use client'

import Card from '@/components/Card'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/components/CartProvider'
import Illustration from '@/components/Illustration'

type Meal = {
  name: string
  type: 'Veg' | 'Non-veg'
  price: number
  image?: string
  description?: string
  labels?: string[]
}

const DEFAULTS: Meal[] = [
  { name: 'Daal + Roti',               type: 'Veg',      price: 250 },
  { name: 'Chicken Curry + Roti',      type: 'Non-veg',  price: 380 },
  { name: 'Chana + Roti',              type: 'Veg',      price: 260 },
  { name: 'Biryani',                   type: 'Non-veg',  price: 420 },
  { name: 'Aloo Palak + Roti',         type: 'Veg',      price: 270 },
  { name: 'Qeema + Roti',              type: 'Non-veg',  price: 390 },
]

const PLACEHOLDER = '/meal-placeholder.svg'
const priceText = (n: number) => `Rs ${n}`

export default function MealsPage() {
  const [filter, setFilter] = useState<'All' | 'Veg' | 'Non-veg'>('All')
  const { add } = useCart()
  const [toast, setToast] = useState<string | null>(null)

  // Load admin meals (if any) from localStorage
  const [adminMeals, setAdminMeals] = useState<Meal[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nm_admin_meals')
      if (raw) {
        const list = JSON.parse(raw) as Array<any>
        const actives = list.filter((m: any) => m.active).map((m: any) => ({
          name: m.name, type: m.type, price: m.price, image: m.image,
          description: m.description, labels: m.labels
        }))
        setAdminMeals(actives)
      }
    } catch {}
  }, [])

  const source = adminMeals.length ? adminMeals : DEFAULTS

  const meals = useMemo(() => {
    if (filter === 'All') return source
    return source.filter(m => m.type === filter)
  }, [filter, source])

  const handleAdd = (m: Meal) => {
    add({ name: m.name, price: m.price })
    setToast(`${m.name} added to cart`)
    setTimeout(() => setToast(null), 1200)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Illustration variant="tray" size={84} />
          <h1 className="h1 m-0">Meals</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('All')} className={`chip ${filter==='All' ? 'ring-2 ring-olive/50' : ''}`}>All</button>
          <button onClick={() => setFilter('Veg')} className={`chip ${filter==='Veg' ? 'ring-2 ring-olive/50' : ''}`}>Veg</button>
          <button onClick={() => setFilter('Non-veg')} className={`chip ${filter==='Non-veg' ? 'ring-2 ring-olive/50' : ''}`}>Non-veg</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {meals.map(m => (
          <Card key={m.name} className="space-y-2 overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[4/3] bg-sand rounded-xl overflow-hidden border border-taupe/40">
              <img src={m.image || PLACEHOLDER} alt={m.name} className="w-full h-full object-cover" />
            </div>

            {/* Meta */}
            <div className="px-2">
              <div className="font-heading text-lg">{m.name}</div>
              {m.description && <div className="muted text-sm">{m.description}</div>}

              {m.labels && m.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.labels.map((lb, i) => (
                    <span key={i} className="chip bg-olive text-white border-olive">{lb}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3">
                <span className="font-medium">{priceText(m.price)}</span>
                <button className="btn btn-outline" onClick={() => handleAdd(m)}>Add to cart</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tiny toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="chip">{toast}</div>
        </div>
      )}
    </div>
  )
}
