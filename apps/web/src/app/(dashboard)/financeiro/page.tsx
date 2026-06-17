import type { Metadata } from 'next';
import { FinancialDashboard } from '@/components/financial/financial-dashboard';

export const metadata: Metadata = { title: 'Financeiro — GPower Studio' };

export default function FinanceiroPage() {
  return <FinancialDashboard />;
}
