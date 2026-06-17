import type { Metadata } from 'next';
import { FlashSalesList } from '@/components/flash-sales/flash-sales-list';

export const metadata: Metadata = { title: 'Flash Sales — GPower Studio' };

export default function FlashSalesPage() {
  return <FlashSalesList />;
}
