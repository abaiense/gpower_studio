import type { Metadata } from 'next';
import { ArtApprovalPage } from '@/components/public/art-approval';

export const metadata: Metadata = { title: 'Aprovação de Arte — GPower Studio' };

export default function ApproveTokenPage({ params }: { params: { token: string } }) {
  return <ArtApprovalPage token={params.token} />;
}
