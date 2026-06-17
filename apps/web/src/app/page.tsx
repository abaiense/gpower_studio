import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('gpower_access_token');

  if (token?.value) {
    redirect('/agenda');
  } else {
    redirect('/login');
  }
}
