export type Status = 'Placed' | 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled'

export default function OrderStatus({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    Placed: 'bg-sand text-charcoal',
    Preparing: 'bg-olive/10 text-olive',
    'On the way': 'bg-terracotta/10 text-terracotta',
    Delivered: 'bg-olive text-white',
    Cancelled: 'bg-charcoal text-white',
  }
  return <span className={`px-3 py-1 rounded-full text-sm ${map[status]}`}>{status}</span>
}
