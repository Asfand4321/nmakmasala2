import Illustration from '@/components/Illustration'
import PlanCard from '@/components/PlanCard'

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="calendar" size={72} />
        <div>
          <h1 className="h1 m-0">Choose a plan</h1>
          <p className="muted">Weekly or Monthly • 1 or 2 meals per day</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlanCard
          title="Weekly • 1 Meal"
          subtitle="Mon–Sat • one slot"
          price="Rs 4000"
          href="/plans/weekly-1"
        />
        <PlanCard
          title="Weekly • 2 Meals"
          subtitle="Lunch + Dinner"
          price="Rs 7600"
          href="/plans/weekly-2"
        />
        <PlanCard
          title="Monthly • 1 Meal"
          subtitle="4 weeks • one slot"
          price="Rs 15500"
          href="/plans/monthly-1"
        />
        <PlanCard
          title="Monthly • 2 Meals"
          subtitle="Lunch + Dinner"
          price="Rs 29500"
          href="/plans/monthly-2"
        />
      </div>
    </div>
  )
}
