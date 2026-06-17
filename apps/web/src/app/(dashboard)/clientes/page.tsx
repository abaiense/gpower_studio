import type { Metadata } from 'next';
import { ClientsList } from '@/components/crm/clients-list';

export const metadata: Metadata = { title: 'Clientes — GPower Studio' };

export default function ClientesPage() {
  return <ClientsList />;
}
