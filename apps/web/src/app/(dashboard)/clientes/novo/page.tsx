import type { Metadata } from 'next';
import { ClientForm } from '@/components/crm/client-form';

export const metadata: Metadata = { title: 'Novo Cliente — GPower Studio' };

export default function NovoClientePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Novo Cliente</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Preencha os dados para cadastrar um novo cliente.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <ClientForm />
      </div>
    </div>
  );
}
