import type { Metadata } from 'next';
import { ConsentSignPage } from '@/components/public/consent-sign';

export const metadata: Metadata = { title: 'Termo de Consentimento — GPower Studio' };

export default function ConsentTokenPage({ params }: { params: { token: string } }) {
  return <ConsentSignPage token={params.token} />;
}
