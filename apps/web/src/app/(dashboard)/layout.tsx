import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get('gpower_access_token');

  if (!token?.value) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
