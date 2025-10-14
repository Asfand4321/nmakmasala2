import Link from 'next/link'
import Illustration from '@/components/Illustration'
import Card from '@/components/Card'

export default function Home() {
  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Illustration variant="tray" size={96} />
          </div>
          <h1 className="h1">Home-made Tiffin, delivered fresh.</h1>
          <p className="muted">Weekly & monthly plans • Lunch & Dinner • Mon–Sat</p>

          <div className="flex gap-2 flex-wrap">
            <Link href="/plans" className="btn btn-primary">Choose a Plan</Link>
            <Link href="/meals" className="btn btn-outline">Browse Meals</Link>
            <Link href="/(auth)/signup" className="btn btn-outline">Sign up</Link>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="chip">Home-cooked</span>
            <span className="chip">On-time delivery</span>
            <span className="chip">Customize non-veg</span>
            <span className="chip">Cash / Card</span>
          </div>
        </div>

        <Card className="p-6">
          <div className="font-heading text-lg mb-2">How it works</div>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Pick a weekly or monthly plan.</li>
            <li>Set your delivery window & address.</li>
            <li>Customize your Mon–Sat meals.</li>
            <li>Place order — we cook & deliver 🔔</li>
          </ol>
        </Card>
      </section>

      {/* HIGHLIGHTS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="muted text-sm">Starting at</div>
          <div className="text-2xl font-heading">Rs 4,000 / week</div>
        </Card>
        <Card className="p-4">
          <div className="muted text-sm">Delivery windows</div>
          <div className="text-2xl font-heading">Lunch • Dinner</div>
        </Card>
        <Card className="p-4">
          <div className="muted text-sm">Service days</div>
          <div className="text-2xl font-heading">Mon – Sat</div>
        </Card>
      </section>

      {/* CTA BANNER */}
      <Card className="p-6 md:p-8 bg-olive text-white relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4">
          <Illustration variant="calendar" size={64} />
          <div>
            {/* 👇 text-black applied */}
            <h2 className="text-2xl font-heading leading-tight text-black">
              Subscribe for the week & save 10%
            </h2>
            <p className="mt-1 text-black">
              Use code <span className="font-semibold">NAMAK10</span> at checkout. Home-made meals, Mon–Sat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/plans" className="btn bg-white text-olive hover:opacity-90">Get started</Link>
            <Link href="/meals" className="btn btn-outline border-white text-white hover:bg-white hover:text-olive">View meals</Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      </Card>
    </div>
  )
}
