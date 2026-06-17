import type { Metadata } from 'next';
import { SettingsNav } from '@/components/settings/settings-nav';
import { CommunicationSettings } from '@/components/settings/communication-settings';

export const metadata: Metadata = { title: 'Comunicação — Configurações — GPower Studio' };

export default function ComunicacaoPage() {
  return (
    <div className="space-y-2">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie as configurações do seu estúdio.</p>
      </div>
      <SettingsNav />
      <CommunicationSettings />
    </div>
  );
}
