import type { Metadata } from 'next';
import Link from 'next/link';
import { Settings2, MessageSquare } from 'lucide-react';

export const metadata: Metadata = { title: 'Configurações — GPower Studio' };

const SECTIONS = [
  {
    href: '/configuracoes/deposito',
    icon: Settings2,
    title: 'Depósito',
    description: 'Configure o valor e o prazo do sinal exigido para confirmar agendamentos.',
  },
  {
    href: '/configuracoes/comunicacao',
    icon: MessageSquare,
    title: 'Comunicação',
    description: 'Conecte WhatsApp e e-mail para enviar notificações automáticas aos clientes.',
  },
] as const;

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie as configurações do seu estúdio.</p>
      </div>

      {/* Geral stub */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Geral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">Nome do estúdio</p>
            <p className="text-sm text-slate-400 italic">Em breve</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">Fuso horário</p>
            <p className="text-sm text-slate-400 italic">Em breve</p>
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                <Icon size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
