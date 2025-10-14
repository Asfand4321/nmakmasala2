'use client'

import { useEffect, useMemo, useState } from 'react'

export type MealType = 'Veg' | 'Non-veg'

export type AdminMeal = {
  id: string
  name: string
  type: MealType
  price: number
  active: boolean
  featured?: boolean
  image?: string
  description?: string          // 👈 NEW
  labels?: string[]             // 👈 NEW
  createdAt: number
  updatedAt: number
}

const KEY = 'nm_admin_meals'

function load(): AdminMeal[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as AdminMeal[]
  } catch {
    return []
  }
}
function save(list: AdminMeal[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
}
function uid() { return 'M-' + Math.random().toString(36).slice(2, 10) }

export function useAdminMeals() {
  const [meals, setMeals] = useState<AdminMeal[]>([])
  useEffect(() => { setMeals(load()) }, [])

  const byId = useMemo(() => {
    const m = new Map<string, AdminMeal>()
    meals.forEach(x => m.set(x.id, x))
    return m
  }, [meals])

  function add(data: Omit<AdminMeal, 'id'|'createdAt'|'updatedAt'>) {
    const rec: AdminMeal = { ...data, id: uid(), createdAt: Date.now(), updatedAt: Date.now() }
    const next = [rec, ...meals]; setMeals(next); save(next)
  }
  function update(id: string, patch: Partial<AdminMeal>) {
    const next = meals.map(m => m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m)
    setMeals(next); save(next)
  }
  function remove(id: string) {
    const next = meals.filter(m => m.id !== id)
    setMeals(next); save(next)
  }

  function seedIfEmpty() {
    if (meals.length) return
    const p = '/meal-placeholder.svg'
    const sample: AdminMeal[] = [
      { id: uid(), name:'Daal + Roti', type:'Veg',      price:250, active:true,  image:p, description:'Comfort daal with 2 rotis.', labels:['Light','Protein'], createdAt:Date.now(), updatedAt:Date.now() },
      { id: uid(), name:'Chicken Curry + Roti', type:'Non-veg', price:380, active:true, image:p, description:'Home-style chicken curry.', labels:['Spicy'], createdAt:Date.now(), updatedAt:Date.now() },
      { id: uid(), name:'Chana + Roti', type:'Veg',     price:260, active:true,  image:p, description:'Masalaydar chana with roti.', labels:['Fibre'], createdAt:Date.now(), updatedAt:Date.now() },
      { id: uid(), name:'Biryani',      type:'Non-veg', price:420, active:true,  image:p, description:'Aromatic rice & chicken.', labels:['Best seller'], createdAt:Date.now(), updatedAt:Date.now() },
      { id: uid(), name:'Aloo Palak + Roti', type:'Veg', price:270, active:false, image:p, description:'Saag & potatoes combo.', labels:['Veg Only'], createdAt:Date.now(), updatedAt:Date.now() },
      { id: uid(), name:'Qeema + Roti', type:'Non-veg', price:390, active:true,  image:p, description:'Minced meat with roti.', labels:['High protein'], createdAt:Date.now(), updatedAt:Date.now() },
    ]
    setMeals(sample); save(sample)
  }

  return { meals, byId, add, update, remove, seedIfEmpty }
}
