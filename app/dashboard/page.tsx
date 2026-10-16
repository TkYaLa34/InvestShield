export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your US stock and ETF investments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
          <p className="text-2xl font-bold">$0.00</p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Day Change</h3>
          <p className="text-2xl font-bold text-muted-foreground">--</p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Watchlist</h3>
          <p className="text-2xl font-bold">0 symbols</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <p className="text-muted-foreground">
          No recent activity. Add stocks or ETFs to your watchlist to get started.
        </p>
      </div>
    </div>
  );
}