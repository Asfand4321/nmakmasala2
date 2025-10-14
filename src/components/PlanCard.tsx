import Link from 'next/link'
import Card from '@/components/Card'

export default function PlanCard({
  title,
  subtitle,
  price,
  href,
}: {
  title: string
  subtitle: string
  price: string
  href: string
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h3 className="h2 text-xl sm:text-2xl">{title}</h3>
        <p className="muted">{subtitle}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-medium">{price}</p>
        <Link className="btn btn-primary" href={href}>Select</Link>
      </div>
    </Card>
  )
}
