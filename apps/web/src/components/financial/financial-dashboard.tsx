'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CashReport } from './cash-report';
import { CommissionTable } from './commission-table';

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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
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

export function FinancialDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(todayIso());

  const { data: report, isLoading, isError } = useQuery<DailyCashReport>({
    queryKey: ['cash-report', selectedDate],
    queryFn: async () => {
      const res = await api.get<DailyCashReport>('/appointments/cash-report', {
        params: { date: selectedDate },
      });
      return res.data;
    },
  });

  const handlePrev = () => setSelectedDate((d) => addDays(d, -1));
  const handleNext = () => setSelectedDate((d) => addDays(d, 1));
  const handleToday = () => setSelectedDate(todayIso());

  const methods = report
    ? Object.entries(report.paymentBreakdown).filter(([, amount]) => amount > 0)
    : [];
  const maxAmount = methods.length > 0 ? Math.max(...methods.map(([, a]) => a)) : 1;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="text-slate-500 text-sm mt-1">Relatório de caixa e comissões por dia</p>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrev}
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-slate-600 text-sm font-medium transition-colors"
          aria-label="Dia anterior"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={handleToday}
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-slate-600 text-sm font-medium transition-colors"
        >
          Hoje
        </button>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-4 py-2">
          <span className="text-slate-900 font-semibold text-sm">
            {formatDisplayDate(selectedDate)}
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="text-xs text-slate-400 bg-transparent border-none outline-none cursor-pointer"
            aria-label="Selecionar data"
          />
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-slate-600 text-sm font-medium transition-colors"
          aria-label="Próximo dia"
        >
          Próximo →
        </button>
      </div>

      {/* Loading / error states */}
      {isLoading && (
        <div className="text-slate-500 text-sm py-8 text-center">Carregando relatório...</div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Não foi possível carregar o relatório. Verifique sua conexão e tente novamente.
        </div>
      )}

      {report && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-slate-500 text-sm">Receita Total</p>
              <p className="text-slate-900 font-bold text-2xl mt-1">
                R$ {report.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-slate-500 text-sm">Sessões Concluídas</p>
              <p className="text-slate-900 font-bold text-2xl mt-1">
                {report.completedAppointments}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-slate-500 text-sm">Cancelamentos</p>
              <p className="text-slate-900 font-bold text-2xl mt-1">
                {report.cancelledAppointments}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-slate-500 text-sm">Agendamentos</p>
              <p className="text-slate-900 font-bold text-2xl mt-1">
                {report.totalAppointments}
              </p>
            </div>
          </div>

          {/* Payment breakdown + daily summary side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-slate-900 font-bold mb-4">Formas de Pagamento</h2>
              {methods.length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhum pagamento registrado neste dia.</p>
              ) : (
                <div className="space-y-3">
                  {methods.map(([method, amount]) => {
                    const barColor = PAYMENT_BAR_COLORS[method] ?? 'bg-slate-400';
                    const label = PAYMENT_METHOD_LABELS[method] ?? method;
                    const widthPct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                    return (
                      <div key={method}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-600 text-sm">{label}</span>
                          <span className="text-slate-900 text-sm font-medium">
                            R$ {amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-300`}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cash report summary */}
            <CashReport report={report} />
          </div>

          {/* Artist commission table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-slate-900 font-bold mb-4">Comissões por Artista</h2>
            <CommissionTable artistSummary={report.artistSummary} />
          </div>
        </>
      )}
    </div>
  );
}
