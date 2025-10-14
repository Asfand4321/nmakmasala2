import Card from '@/components/Card'

export default function SummaryCard({
  items,
  total,
  children,
}: {
  items: { label: string; value: string }[]
  total?: string
  children?: React.ReactNode
}) {
  return (
    <Card className="space-y-3">
      <h4 className="font-heading text-lg">Order Summary</h4>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex justify-between">
            <span className="muted">{it.label}</span>
            <span className="font-medium">{it.value}</span>
          </li>
        ))}
      </ul>
      {total && (
        <div className="pt-2 border-t border-taupe/40 flex justify-between text-lg">
          <span>Total</span>
          <span className="font-semibold">{total}</span>
        </div>
      )}
      {children}
    </Card>
  )
}
