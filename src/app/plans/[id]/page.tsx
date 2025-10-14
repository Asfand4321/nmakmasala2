'use client'

import { useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import SummaryCard from '@/components/SummaryCard'
import Card from '@/components/Card'

type Cat = 'Veg' | 'Non-veg'
type Choice = { cat: Cat; dish: string }

type Win = {
  sh: string; sm: string; sap: 'AM' | 'PM';
  eh: string; em: string; eap: 'AM' | 'PM';
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat']

type Dish = { name: string; img: string }
const PH = '/meal-placeholder.svg'

const VEG: Dish[] = [
  { name: 'Daal + Roti',        img: '/meals/daal-roti.jpg' },
  { name: 'Sabzi + Roti',       img: '/meals/sabzi-roti.jpg' },
  { name: 'Chana + Roti',       img: '/meals/chana-roti.jpg' },
  { name: 'Mix Veg + Roti',     img: '/meals/mix-veg-roti.jpg' },
  { name: 'Aloo Palak + Roti',  img: '/meals/aloo-palak-roti.jpg' },
  { name: 'Bhindi + Roti',      img: '/meals/bhindi-roti.jpg' },
]

const NON: Dish[] = [
  { name: 'Chicken Curry + Roti', img: '/meals/chicken-curry-roti.jpg' },
  { name: 'Qeema + Roti',         img: '/meals/qeema-roti.jpg' },
  { name: 'Chicken Karahi + Roti',img: '/meals/chicken-karahi-roti.jpg' },
  { name: 'Biryani',              img: '/meals/biryani.jpg' },
  { name: 'Haleem',               img: '/meals/haleem.jpg' },
  { name: 'Chicken Handi + Naan', img: '/meals/chicken-handi-naan.jpg' },
]

// price rules
const PRICING: Record<string, number> = {
  'weekly-1': 4000,
  'weekly-2': 7600,
  'monthly-1': 15500,
  'monthly-2': 29500,
}
const INCLUDED_NONVEG_BASE = 3
const SURCHARGE_PER_EXTRA_NONVEG = 50

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']
const AP = ['AM', 'PM'] as const

function mins(h: string, m: string, ap: 'AM'|'PM') {
  let hh = parseInt(h, 10) % 12
  if (ap === 'PM') hh += 12
  return hh * 60 + parseInt(m, 10)
}
function winLabel(w: Win) { return `${w.sh}:${w.sm} ${w.sap} – ${w.eh}:${w.em} ${w.eap}` }

function getDish(cat: Cat, name: string | undefined): Dish {
  const list = cat === 'Veg' ? VEG : NON
  const found = list.find(d => d.name === name)
  return found ?? { name: name || '', img: PH }
}

function WindowPicker({label,value,onChange}:{label:string;value:Win;onChange:(w:Win)=>void}) {
  const invalid = mins(value.sh, value.sm, value.sap) >= mins(value.eh, value.em, value.eap)
  const set = (k: keyof Win, v: string) => onChange({ ...value, [k]: v } as Win)

  return (
    <div className="space-y-2">
      <div className="label">{label}</div>
      <div className="grid grid-cols-2 sm:grid-cols-8 gap-2 items-center">
        <select className="input" value={value.sh} onChange={(e) => set('sh', e.target.value)}>{HOURS.map(h => <option key={h} value={h}>{h}</option>)}</select>
        <select className="input" value={value.sm} onChange={(e) => set('sm', e.target.value)}>{MINUTES.map(m => <option key={m} value={m}>{m}</option>)}</select>
        <select className="input" value={value.sap} onChange={(e) => set('sap', e.target.value as 'AM'|'PM')}>{AP.map(a => <option key={a} value={a}>{a}</option>)}</select>
        <div className="text-center muted hidden sm:block">to</div>
        <select className="input" value={value.eh} onChange={(e) => set('eh', e.target.value)}>{HOURS.map(h => <option key={h} value={h}>{h}</option>)}</select>
        <select className="input" value={value.em} onChange={(e) => set('em', e.target.value)}>{MINUTES.map(m => <option key={m} value={m}>{m}</option>)}</select>
        <select className="input" value={value.eap} onChange={(e) => set('eap', e.target.value as 'AM'|'PM')}>{AP.map(a => <option key={a} value={a}>{a}</option>)}</select>
        <div className="sm:col-span-8">{invalid && (<p className="text-sm text-terracotta mt-1">End time must be after start time.</p>)}</div>
      </div>
    </div>
  )
}

export default function PlanDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>() // 'weekly-1' | 'weekly-2' | 'monthly-1' | 'monthly-2'
  const isTwoMeals = id.includes('-2')
  const isMonthly = id.startsWith('monthly')
  const basePrice = PRICING[id] ?? 4000

  // Delivery windows + address
  const [win1, setWin1] = useState<Win>({ sh: '11', sm: '00', sap: 'AM', eh: '12', em: '00', eap: 'PM' })
  const [win2, setWin2] = useState<Win>({ sh: '07', sm: '00', sap: 'PM', eh: '08', em: '00', eap: 'PM' })
  const [address, setAddress] = useState('')

  // Weekly selections (6 days; if 2 meals → 2 slots per day)
  type ChoiceRow = [Choice, Choice?]
  const defaultDay = (i: number): ChoiceRow => {
    const first: Choice = i < 3 ? { cat: 'Veg', dish: VEG[i].name } : { cat: 'Non-veg', dish: NON[i].name }
    const second: Choice | undefined = isTwoMeals
      ? (i % 2 === 0 ? { cat: 'Non-veg', dish: NON[i].name } : { cat: 'Veg', dish: VEG[i].name })
      : undefined
    return [first, second]
  }
  const [choices, setChoices] = useState<Array<ChoiceRow>>(DAYS.map((_, i) => defaultDay(i)))

  const setCat = (dayIdx: number, slotIdx: 0 | 1, cat: Cat) => {
    setChoices(prev => {
      const copy = prev.map(row => [...row]) as Array<ChoiceRow>
      const row = copy[dayIdx]
      const current = (row[slotIdx] ?? { cat, dish: '' }) as Choice
      const list = cat === 'Veg' ? VEG : NON
      const newDish = list.find(d => d.name !== current.dish)?.name ?? list[0].name
      row[slotIdx] = { cat, dish: newDish }
      return copy
    })
  }
  const setDish = (dayIdx: number, slotIdx: 0 | 1, dish: string) => {
    setChoices(prev => {
      const copy = prev.map(row => [...row]) as Array<ChoiceRow>
      const row = copy[dayIdx]
      if (!row[slotIdx]) return copy
      const cat: Cat = (row[slotIdx] as Choice).cat
      row[slotIdx] = { cat, dish }
      return copy
    })
  }

  // Pricing counts
  const nonVegWeek = useMemo(() => {
    let c = 0
    for (const row of choices) for (const slot of row) if (slot?.cat === 'Non-veg') c++
    return c
  }, [choices])

  const weekFactor = isMonthly ? 4 : 1
  const includedNonVeg = INCLUDED_NONVEG_BASE * (isTwoMeals ? 2 : 1) * weekFactor
  const chosenNonVeg = nonVegWeek * weekFactor
  const extraNonVeg = Math.max(0, chosenNonVeg - includedNonVeg)
  const total = basePrice + extraNonVeg * SURCHARGE_PER_EXTRA_NONVEG

  // Window validity
  const w1ok = mins(win1.sh, win1.sm, win1.sap) < mins(win1.eh, win1.em, win1.eap)
  const w2ok = !isTwoMeals || mins(win2.sh, win2.sm, win2.sap) < mins(win2.eh, win2.em, win2.eap)

  // Continue
  const handleContinue = () => {
    if (!w1ok || !w2ok || !address.trim()) {
      alert('Please provide a valid delivery window(s) and address.')
      return
    }
    const payload = {
      planId: id,
      isTwoMeals,
      isMonthly,
      windows: [win1, isTwoMeals ? win2 : null] as const,
      address,
      includedNonVeg,
      chosenNonVeg,
      extraNonVeg,
      total,
      weekMenu: choices,
    }
    try {
      localStorage.setItem('nm_plan_checkout', JSON.stringify(payload))
      router.push('/checkout')
    } catch (e) {
      console.error(e)
      alert('Unable to proceed — storage error.')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* left: customization */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="h1 capitalize">{id.replace('-', ' • ')}</h1>
        <p className="muted">
          Choose delivery window{isTwoMeals ? 's' : ''} & review weekly menu (Mon–Sat)
          {isMonthly ? ' (applies to all 4 weeks)' : ''}.
        </p>

        {/* Delivery windows */}
        <Card className="space-y-4">
          <h3 className="font-heading text-lg">Delivery window</h3>
          <WindowPicker label="Meal 1 window" value={win1} onChange={setWin1} />
          {isTwoMeals && <WindowPicker label="Meal 2 window" value={win2} onChange={setWin2} />}

          <div>
            <label className="label">Delivery address</label>
            <input
              className="input"
              placeholder="House/Office address"
              value={address}
              onChange={(e)=>setAddress(e.target.value)}
            />
          </div>
        </Card>

        {/* Weekly menu with thumbnails */}
        <Card className="space-y-4">
          <h3 className="font-heading text-lg">Weekly menu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DAYS.map((day, i) => {
              const row = choices[i]
              const slots = isTwoMeals ? [0,1] : [0]
              return (
                <div key={day} className="border border-taupe/40 rounded-xl p-3 space-y-3">
                  <div className="font-medium">{day}</div>
                  {slots.map((s) => {
                    const ch = row[s] as Choice
                    const dish = getDish(ch?.cat ?? 'Veg', ch?.dish)
                    return (
                      <div key={s} className="space-y-2">
                        {isTwoMeals && <div className="muted text-xs">Meal {s+1}</div>}

                        {/* Thumbnail */}
                        <div className="relative w-full h-28 overflow-hidden rounded-lg bg-sand/50">
                          <Image
                            src={dish.img || PH}
                            alt={dish.name || 'Dish image'}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>

                        {/* toggles */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCat(i, s as 0|1, 'Veg')}
                            className={`chip ${ch?.cat === 'Veg' ? 'ring-2 ring-olive/50' : ''}`}
                          >
                            Veg
                          </button>
                          <button
                            type="button"
                            onClick={() => setCat(i, s as 0|1, 'Non-veg')}
                            className={`chip ${ch?.cat === 'Non-veg' ? 'ring-2 ring-terracotta/50' : ''}`}
                          >
                            Non-veg
                          </button>
                        </div>

                        {/* dish select */}
                        <select
                          className="input"
                          value={ch?.dish ?? ''}
                          onChange={(e) => setDish(i, s as 0|1, e.target.value)}
                        >
                          {(ch?.cat === 'Veg' ? VEG : NON).map(d => (
                            <option key={d.name} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <p className="muted text-sm">
            Rule: {INCLUDED_NONVEG_BASE} non-veg per week included for 1-meal plan.
            2-meals → x2, Monthly → x4. More than included non-veg adds charges (Rs {SURCHARGE_PER_EXTRA_NONVEG} each).
          </p>
        </Card>
      </div>

      {/* right: summary */}
      <div className="space-y-4">
        <SummaryCard
          items={[
            { label: 'Plan', value: id.replace('-', ' • ') },
            { label: 'Slots', value: isTwoMeals ? '2 per day' : '1 per day' },
            { label: 'Window 1', value: winLabel(win1) + (!w1ok ? ' (invalid)' : '') },
            ...(isTwoMeals ? [{ label: 'Window 2', value: winLabel(win2) + (!w2ok ? ' (invalid)' : '') }] : []),
            { label: 'Non-veg chosen', value: `${chosenNonVeg}` },
            { label: 'Included non-veg', value: `${includedNonVeg}` },
            { label: 'Extra non-veg', value: `${extraNonVeg}` },
          ]}
          total={`Rs ${total}`}
        >
          <button
            className="btn btn-primary w-full mt-3"
            disabled={!w1ok || !w2ok || !address.trim()}
            onClick={handleContinue}
          >
            Continue
          </button>
        </SummaryCard>
      </div>
    </div>
  )
}
