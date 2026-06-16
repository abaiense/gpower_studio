import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — GPower Studio',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Bem-vindo ao GPower Studio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Agendamentos Hoje', 'Clientes Ativos', 'Receita do Mês', 'Artistas'].map(
          (label) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-2"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900">—</p>
            </div>
          ),
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-400 text-sm">
          Mais funcionalidades em breve. Configure seu estúdio para começar.
        </p>
      </div>
    </div>
  );
}
