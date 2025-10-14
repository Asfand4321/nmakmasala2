'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/Card'
import SummaryCard from '@/components/SummaryCard'
import { useCart } from '@/components/CartProvider'
import { useRouter } from 'next/navigation'
import { useAdminOrders } from '@/components/admin/useAdminOrders'
import { usePayments } from '@/components/admin/usePayments'

// ---- types (light) ----
type Win = { sh:string; sm:string; sap:'AM'|'PM'; eh:string; em:string; eap:'AM'|'PM' }
type Choice = { cat: 'Veg'|'Non-veg'; dish: string }
type ChoiceRow = [Choice, Choice?]
type PlanPayload = {
  planId: string
  isTwoMeals: boolean
  isMonthly: boolean
  windows: [Win, Win|null]
  address: string
  includedNonVeg: number
  chosenNonVeg: number
  extraNonVeg: number
  total: number
  weekMenu: ChoiceRow[]
}

function money(n:number){ return `Rs ${n}` }

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clear } = useCart()
  const { add: addAdminOrder } = useAdminOrders()
  const up = usePayments() as any
const addPayment =
  (up && typeof up.add === 'function')
    ? up.add
    : ((p: any) => {
        try {
          const raw = localStorage.getItem('nm_payments')
          const list = raw ? JSON.parse(raw) : []
          list.unshift(p)
          localStorage.setItem('nm_payments', JSON.stringify(list))
        } catch {}
      })


  const [loaded, setLoaded] = useState(false)
  const [planData, setPlanData] = useState<PlanPayload | null>(null)

  // Shared inputs
  const [phone, setPhone] = useState<string>(() => {
    try { return localStorage.getItem('nm_user_phone') || '' } catch { return '' }
  })
  const [address, setAddress] = useState<string>('')

  // Meal-mode payment selection
  const [mealPay, setMealPay] = useState<'cod'|'card'>('cod')

  // Load planData from storage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nm_plan_checkout')
      setPlanData(raw ? JSON.parse(raw) as PlanPayload : null)
    } catch { setPlanData(null) }
    setLoaded(true)
  }, [])

  // Determine mode
  const hasCart = items.length > 0
  const mode: 'plan' | 'meal' | 'empty' = useMemo(() => {
    if (planData) return 'plan'
    if (!planData && hasCart) return 'meal'
    return 'empty'
  }, [planData, hasCart])

  useEffect(() => {
    // Prefill address: planData.address if present
    if (planData?.address) setAddress(planData.address)
  }, [planData])

  // ---------- ACTIONS ----------
  function placeMealOrder() {
    if (!phone.trim() || !address.trim()) { alert('Please enter phone and address.'); return }
    if (items.length === 0) { alert('Your cart is empty.'); return }

    // Total
    const total = items.reduce((s, it) => s + (it.price * (it.qty ?? 1)), 0)

    // Create Admin order (MEAL source)
    const id = `NM-${Date.now()}`
    addAdminOrder({
      id,
      createdAt: Date.now(),
      status: 'placed',
      source: 'meal',
      customer: { phone },
      address,
      items: items.map(it => ({ name: it.name, qty: it.qty ?? 1, price: it.price })),
      total,
    })

    // Log payment
    addPayment({
      id: `PAY-${Date.now()}`,
      refType: 'meal',
      refId: id,
      amount: total,
      methodKind: mealPay,
      methodName: mealPay === 'cod' ? 'Cash on Delivery' : 'Card (demo)',
      status: mealPay === 'cod' ? 'cod_pending' : 'paid',
      createdAt: Date.now()
    })

    try { localStorage.setItem('nm_user_phone', phone) } catch {}
    clear()
    alert('Order placed! Thank you.')
    router.push('/orders')
  }

  function placePlanOrder() {
    // For plan: plan already priced, must be paid online (as per your rule)
    if (!planData) return
    if (!phone.trim()) { alert('Please enter phone.'); return }
    try { localStorage.setItem('nm_user_phone', phone) } catch {}

    // Save subscription for user view (My Plans)
    try {
      const raw = localStorage.getItem('nm_user_plans')
      const list = raw ? JSON.parse(raw) as any[] : []
      const subId = `SUB-${Date.now()}`
      // generate deliveries quickly (Mon–Sat for this/next week, simple demo)
      const start = new Date()
      const deliveries: any[] = []
      const weeks = planData.isMonthly ? 4 : 1
      for (let w=0; w<weeks; w++){
        for (let i=0; i<6; i++){
          const d = new Date(start); d.setDate(d.getDate() + (w*7) + i + 1)
          const y = d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0')
          const date = `${y}-${m}-${day}`
          const slots = planData.isTwoMeals ? [1,2] : [1]
          for (const slot of slots) {
            deliveries.push({
              date, slot,
              code: `NM-${subId}-${date}-${slot}-${Math.floor(1000+Math.random()*9000)}`,
              status: 'pending'
            })
          }
        }
      }

      const sub = {
        id: subId,
        createdAt: Date.now(),
        planId: planData.planId,
        isTwoMeals: planData.isTwoMeals,
        isMonthly: planData.isMonthly,
        startFrom: new Date().toISOString().slice(0,10),
        address: planData.address,
        windows: planData.windows,
        userPhone: phone,
        userEmail: '',
        total: planData.total,
        deliveries,
        weekMenu: planData.weekMenu,
      }
      list.unshift(sub)
      localStorage.setItem('nm_user_plans', JSON.stringify(list))
    } catch {}

    // Payment record (online)
    addPayment({
      id: `PAY-${Date.now()}`,
      refType: 'plan',
      refId: planData.planId,
      amount: planData.total,
      methodKind: 'card',
      methodName: 'Card (demo)',
      status: 'paid',
      createdAt: Date.now(),
    })

    // cleanup
    try { localStorage.removeItem('nm_plan_checkout') } catch {}
    alert('Subscription activated! Thank you.')
    router.push('/my-plans')
  }

  // ---------- UI BLOCKS ----------
  const mealSummary = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + it.price * (it.qty ?? 1), 0)
    return (
      <SummaryCard
        items={[
          ...items.map(it => ({ label: `${it.name} × ${it.qty ?? 1}`, value: money(it.price * (it.qty ?? 1)) })),
        ]}
        total={money(subtotal)}
      >
        <div className="space-y-3">
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+92…" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          </div>
          <div>
            <label className="label">Delivery address</label>
            <input className="input" placeholder="House/Office address" value={address} onChange={(e)=>setAddress(e.target.value)} />
          </div>
          <div>
            <label className="label">Payment</label>
            <div className="flex gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="pay" checked={mealPay==='cod'} onChange={()=>setMealPay('cod')} />
                <span>Cash on Delivery</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="pay" checked={mealPay==='card'} onChange={()=>setMealPay('card')} />
                <span>Card (demo)</span>
              </label>
            </div>
          </div>
          <button className="btn btn-primary w-full" onClick={placeMealOrder}>Place Order</button>
        </div>
      </SummaryCard>
    )
  }, [items, phone, address, mealPay])

  const planSummary = useMemo(() => {
    if (!planData) return null
    const [w1, w2] = planData.windows
    const wlabel = (w?:Win|null) => w ? `${w.sh}:${w.sm} ${w.sap} – ${w.eh}:${w.em} ${w.eap}` : '—'
    return (
      <SummaryCard
        items={[
          { label: 'Plan', value: planData.planId.replace('-', ' • ') },
          { label: 'Slots', value: planData.isTwoMeals ? '2 per day' : '1 per day' },
          { label: 'Meal 1 window', value: wlabel(w1) },
          ...(planData.isTwoMeals ? [{ label: 'Meal 2 window', value: wlabel(w2!) }] : []),
          { label: 'Included non-veg', value: String(planData.includedNonVeg) },
          { label: 'Chosen non-veg', value: String(planData.chosenNonVeg) },
          { label: 'Extra non-veg', value: String(planData.extraNonVeg) },
        ]}
        total={money(planData.total)}
      >
        <div className="space-y-3">
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+92…" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          </div>
          <p className="muted text-sm">Subscriptions must be paid online. (Demo: instantly marked paid)</p>
          <button className="btn btn-primary w-full" onClick={placePlanOrder}>Pay & Activate</button>
        </div>
      </SummaryCard>
    )
  }, [planData, phone])

  if (!loaded) return <div className="muted">Loading…</div>

  if (mode === 'empty') {
    // Nothing to checkout
    return (
      <div className="space-y-4">
        <h1 className="h1">Checkout</h1>
        <Card>
          <p className="muted">Your cart is empty and no plan selected.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* left */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="h1">
          {mode === 'plan' ? 'Subscription Checkout' : 'Meals Checkout'}
        </h1>

        {mode === 'plan' && planData && (
          <Card className="space-y-3">
            <div className="font-heading text-lg">{planData.planId.replace('-', ' • ')}</div>
            <div className="muted text-sm">
              {planData.isMonthly ? 'Weeks: 4' : 'Weeks: 1'} • Slots/day: {planData.isTwoMeals ? 2 : 1}
            </div>
            <div className="muted text-sm">Address: {planData.address}</div>
          </Card>
        )}

        {mode === 'meal' && (
          <Card className="space-y-3">
            <div className="font-heading text-lg">Your items</div>
            <ul className="list-disc pl-5">
              {items.map((it, idx) => (
                <li key={idx}>{it.name} × {it.qty ?? 1} — {money(it.price * (it.qty ?? 1))}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* right: summary */}
      <div>
        {mode === 'plan' ? planSummary : mealSummary}
      </div>
    </div>
  )
}
