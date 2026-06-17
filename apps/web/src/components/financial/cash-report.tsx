'use client';

interface DailyCashReport {
  date: string;
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  paymentBreakdown: Record<string, number>;
  artistSummary: Array<{
    artistId: string;
    artistName: string;
    sessions: number;
    revenue: number;
    artistEarns: number;
    studioEarns: number;
  }>;
}

interface CashReportProps {
  report: DailyCashReport;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão Crédito',
  DEBIT_CARD: 'Cartão Débito',
  BANK_TRANSFER: 'Transferência',
};

const PAYMENT_BAR_COLORS: Record<string, string> = {
  CASH: 'bg-emerald-500',
  PIX: 'bg-blue-500',
  CREDIT_CARD: 'bg-purple-500',
  DEBIT_CARD: 'bg-indigo-500',
  BANK_TRANSFER: 'bg-amber-500',
};

export function CashReport({ report }: CashReportProps) {
  const methods = Object.entries(report.paymentBreakdown).filter(([, amount]) => amount > 0);
  const maxAmount = methods.length > 0 ? Math.max(...methods.map(([, a]) => a)) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <h3 className="text-slate-900 font-bold">Resumo do Dia</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500 text-xs">Receita Total</p>
          <p className="text-slate-900 font-bold text-lg">
            R$ {report.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500 text-xs">Sessões Concluídas</p>
          <p className="text-slate-900 font-bold text-lg">{report.completedAppointments}</p>
        </div>
      </div>

      {methods.length > 0 && (
        <div>
          <p className="text-slate-700 text-sm font-medium mb-3">Formas de Pagamento</p>
          <div className="space-y-2">
            {methods.map(([method, amount]) => {
              const barColor = PAYMENT_BAR_COLORS[method] ?? 'bg-slate-400';
              const label = PAYMENT_METHOD_LABELS[method] ?? method;
              const widthPct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
              return (
                <div key={method} className="flex items-center gap-3">
                  <span className="text-slate-600 text-xs w-28 flex-shrink-0">{label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="text-slate-700 text-xs font-medium w-20 text-right flex-shrink-0">
                    R$ {amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
