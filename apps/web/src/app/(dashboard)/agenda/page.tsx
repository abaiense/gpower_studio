import type { Metadata } from 'next';
import { CalendarView } from '@/components/calendar/calendar-view';

export const metadata: Metadata = { title: 'Agenda — GPower Studio' };

export default function AgendaPage() {
  return <CalendarView />;
}
