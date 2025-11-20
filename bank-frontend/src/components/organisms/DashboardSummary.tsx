"use client";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  createdAt: string;
};

type DashboardSummaryProps = {
  balance: number;
  debitHistory: Transaction[];
  creditHistory: Transaction[];
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function DashboardSummary({
  balance,
  debitHistory,
  creditHistory,
}: DashboardSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-xs uppercase text-slate-500 mb-1">
            Current Balance
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            AED {balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold mb-2 text-slate-800">
            Debit History
          </h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {debitHistory.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-2 text-center text-slate-500"
                      colSpan={2}
                    >
                      No debit transactions
                    </td>
                  </tr>
                ) : (
                  debitHistory.map((tx) => (
                    <tr key={tx.id} className="border-t">
                      <td className="px-3 py-2 text-red-600 font-medium">
                        - AED {tx.amount.toFixed(2)}
                      </td>
                      <td
                        className="px-3 py-2 text-xs text-slate-500"
                        suppressHydrationWarning
                      >
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2 text-slate-800">
            Credit History
          </h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {creditHistory.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-2 text-center text-slate-500"
                      colSpan={2}
                    >
                      No credit transactions
                    </td>
                  </tr>
                ) : (
                  creditHistory.map((tx) => (
                    <tr key={tx.id} className="border-t">
                      <td className="px-3 py-2 text-green-700 font-medium">
                        + AED {tx.amount.toFixed(2)}
                      </td>
                      <td
                        className="px-3 py-2 text-xs text-slate-500"
                        suppressHydrationWarning
                      >
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}