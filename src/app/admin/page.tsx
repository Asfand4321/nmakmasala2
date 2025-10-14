import Card from '@/components/Card'
import Illustration from '@/components/Illustration'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Illustration variant="chart" size={56} />
        <div>
          <h1 className="h1 m-0">Dashboard</h1>
          <p className="muted">Today’s overview</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="muted text-sm">New orders</div>
          <div className="text-2xl font-heading">12</div>
        </Card>
        <Card className="p-4">
          <div className="muted text-sm">Preparing</div>
          <div className="text-2xl font-heading">7</div>
        </Card>
        <Card className="p-4">
          <div className="muted text-sm">Out for delivery</div>
          <div className="text-2xl font-heading">3</div>
        </Card>
        <Card className="p-4">
          <div className="muted text-sm">Revenue (est.)</div>
          <div className="text-2xl font-heading">Rs 8,450</div>
        </Card>
      </div>

      {/* Recent orders (stub) */}
      <Card className="p-4">
        <div className="font-heading text-lg mb-2">Recent orders</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'NM-1025', item: 'Biryani', when: '1:15 PM', status: 'preparing' },
            { id: 'NM-1024', item: 'Daal + Roti', when: '12:40 PM', status: 'placed' },
            { id: 'NM-1023', item: 'Qeema + Roti', when: '11:55 AM', status: 'out' },
            { id: 'NM-1022', item: 'Chicken Curry + Roti', when: '11:10 AM', status: 'delivered' },
          ].map(o => (
            <div key={o.id} className="flex items-center justify-between border border-taupe/40 rounded-xl px-3 py-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{o.item} <span className="muted">• {o.id}</span></div>
                <div className="muted text-sm">{o.when}</div>
              </div>
              <span className="chip">{o.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
