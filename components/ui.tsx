export function FinancialDisclaimer() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-6">
      <p className="text-sm text-amber-800">
        <strong className="font-semibold">Disclaimer:</strong> This webapp is for
        informational and educational purposes only. It does not constitute
        financial advice, investment recommendations, or an offer to buy or sell
        any securities. Market data may be delayed and is not guaranteed to be
        accurate. Always consult with a qualified financial advisor before making
        investment decisions. Investing involves risk, including loss of
        principal.
      </p>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}