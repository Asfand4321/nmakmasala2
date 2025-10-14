import Illustration from '@/components/Illustration'
import Card from '@/components/Card'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Title + animated chart vibe */}
      <div className="flex items-center gap-3">
        <Illustration variant="chart" size={64} />
        <div>
          <h1 className="h1 m-0">Dashboard</h1>
          <p className="muted">Overview of your spend & orders</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="muted text-sm">Total spend</div>
          <div className="text-2xl font-heading">Rs 12,930</div>
        </Card>
        <Card className="p-4">
          <div className="muted text-sm">Orders</div>
          <div className="text-2xl font-heading">27</div>
        </Card>
        <Card className="p-4">
          <div className="muted text-sm">On-time deliveries</div>
          <div className="text-2xl font-heading">96%</div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="p-4">
        <div className="font-heading text-lg mb-3">Recent activity</div>
        <ul className="space-y-2">
          <li className="flex items-center justify-between">
            <span className="truncate">Biryani • Oct 06, 1:20 PM</span>
            <span className="muted">Rs 420</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="truncate">Qeema + Roti • Oct 03, 7:40 PM</span>
            <span className="muted">Rs 390</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="truncate">Daal + Roti • Oct 01, 12:50 PM</span>
            <span className="muted">Rs 250</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
