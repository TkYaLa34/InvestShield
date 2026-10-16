export default function WatchlistPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-muted-foreground">
            Track your favorite US stocks and ETFs.
          </p>
        </div>
        <button className="btn-primary">
          Add Symbol
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                <th className="py-3 text-sm font-medium text-muted-foreground">Name</th>
                <th className="py-3 text-sm font-medium text-muted-foreground">Price</th>
                <th className="py-3 text-sm font-medium text-muted-foreground">Change</th>
                <th className="py-3 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4">AAPL</td>
                <td className="py-4">Apple Inc.</td>
                <td className="py-4">$150.00</td>
                <td className="py-4">+1.25 (+0.84%)</td>
                <td className="py-4">
                  <button className="text-destructive">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}