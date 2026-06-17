import type { Metadata } from 'next';
import { ClientProfile } from '@/components/crm/client-profile';

export const metadata: Metadata = { title: 'Cliente — GPower Studio' };

export default function ClienteProfilePage({ params }: { params: { id: string } }) {
  return <ClientProfile clientId={params.id} />;
}
