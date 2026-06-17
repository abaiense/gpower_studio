import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estoque — GPower Studio',
};

export default function EstoquePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
        <p className="text-slate-500 mt-1">Gerencie seus produtos e insumos.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-400 text-sm">
          Módulo de estoque em desenvolvimento.
        </p>
      </div>
    </div>
  );
}
