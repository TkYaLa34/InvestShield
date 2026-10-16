export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your US stock and ETF positions.
          </p>
        </div>
        <button className="btn-primary">
          Add Position
        </button>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Holdings</h3>
        <p className="text-muted-foreground">
          No positions yet. Add your first position to start tracking.
        </p>
      </div>
    </div>
  );
}