import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';

   export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  
  // NOTE: This validates only cookie presence, not JWT signature/expiry.
  // Expired tokens pass this guard and are handled by the API interceptor on first request.
  // NOTE: In Next.js 15+, cookies() returns a Promise and requires await
   const cookieStore = await cookies();
  const token = cookieStore.get('gpower_access_token');

  if (!token?.value) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
