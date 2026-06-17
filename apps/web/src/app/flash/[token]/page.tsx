import type { Metadata } from 'next';
import { FlashClaimPage } from '@/components/public/flash-claim';

export const metadata: Metadata = { title: 'Flash Sale — GPower Studio' };

export default function FlashTokenPage({ params }: { params: { token: string } }) {
  return <FlashClaimPage token={params.token} />;
}
