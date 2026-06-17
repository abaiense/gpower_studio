'use client';

import { useState, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import type {
  EventClickArg,
  DateSelectArg,
  EventDropArg,
  DatesSetArg,
  EventContentArg,
} from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppointmentModal } from './appointment-modal';
import type { Appointment, Artist, AppointmentStatus } from './appointment-form';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: '#f59e0b',
  DEPOSIT_PAID: '#3b82f6',
  CONFIRMED: '#10b981',
  IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#6b7280',
  CANCELLED: '#ef4444',
  NO_SHOW: '#9ca3af',
};

interface DateRange {
  start: string;
  end: string;
}

interface ModalState {
  open: boolean;
  appointment: Appointment | null;
  initialStartAt?: string;
  initialEndAt?: string;
}

export function CalendarView() {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);

  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    appointment: null,
  });

  // Fetch artists for filter pills
  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      const res = await api.get('/artists');
      return res.data;
    },
  });

  // Fetch appointments for current date range
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments', dateRange, selectedArtistId],
    queryFn: async () => {
      if (!dateRange.start) return [];
      const params: Record<string, string> = {
        startDate: dateRange.start,
        endDate: dateRange.end,
      };
      if (selectedArtistId) params.artistId = selectedArtistId;
      const res = await api.get('/appointments', { params });
      return res.data;
    },
    enabled: Boolean(dateRange.start),
  });

  const patchMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; startAt?: string; endAt?: string }) => {
      const res = await api.patch(`/appointments/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: () => {
      // Revert the optimistic UI by refetching
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const events = appointments.map((apt) => ({
    id: apt.id,
    title: `${apt.client.firstName} ${apt.client.lastName}`,
    start: apt.startAt,
    end: apt.endAt,
    backgroundColor: STATUS_COLORS[apt.status],
    borderColor: STATUS_COLORS[apt.status],
    extendedProps: { appointment: apt },
  }));

  const handleDatesSet = useCallback((info: DatesSetArg) => {
    setDateRange({
      start: info.startStr,
      end: info.endStr,
    });
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const apt = info.event.extendedProps.appointment as Appointment;
    setModalState({ open: true, appointment: apt });
  }, []);

  const handleSelect = useCallback((info: DateSelectArg) => {
    setModalState({
      open: true,
      appointment: null,
      initialStartAt: info.startStr,
      initialEndAt: info.endStr,
    });
  }, []);

  const handleEventDrop = useCallback(
    (info: EventDropArg) => {
      const id = info.event.id;
      const startAt = info.event.startStr;
      const endAt = info.event.endStr;
      patchMutation.mutate({ id, startAt, endAt });
    },
    [patchMutation],
  );

  const handleEventResize = useCallback(
    (info: EventResizeDoneArg) => {
      const id = info.event.id;
      const endAt = info.event.endStr;
      patchMutation.mutate({ id, endAt });
    },
    [patchMutation],
  );

  const closeModal = useCallback(() => {
    setModalState({ open: false, appointment: null });
  }, []);

  const activeArtists = artists.filter((a) => a.isActive);

  return (
    <div className="flex flex-col h-full">
      {/* Artist filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSelectedArtistId('')}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            selectedArtistId === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {activeArtists.map((artist) => (
          <button
            key={artist.id}
            type="button"
            onClick={() =>
              setSelectedArtistId(selectedArtistId === artist.id ? '' : artist.id)
            }
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedArtistId === artist.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {artist.firstName} {artist.lastName}
          </button>
        ))}
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {(
          [
            ['PENDING', 'Pendente'],
            ['DEPOSIT_PAID', 'Sinal Pago'],
            ['CONFIRMED', 'Confirmado'],
            ['IN_PROGRESS', 'Em Andamento'],
            ['COMPLETED', 'Concluído'],
            ['CANCELLED', 'Cancelado'],
            ['NO_SHOW', 'Não Compareceu'],
          ] as [AppointmentStatus, string][]
        ).map(([status, label]) => (
          <span key={status} className="flex items-center gap-1 text-xs text-gray-600">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* Calendar */}
      <div className="flex-1 rounded-xl bg-white shadow-sm border border-gray-100 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          locale={ptBrLocale}
          editable
          selectable
          selectMirror
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          events={events}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          select={handleSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={(info: EventContentArg) => {
            const apt = info.event.extendedProps.appointment as Appointment | undefined;
            return (
              <div className="px-1 py-0.5 overflow-hidden text-xs leading-tight">
                <div className="font-semibold truncate">{info.event.title}</div>
                {apt?.service?.name && (
                  <div className="truncate opacity-90">{apt.service.name}</div>
                )}
              </div>
            );
          }}
          nowIndicator
          allDaySlot={false}
        />
      </div>

      {/* Appointment modal */}
      <AppointmentModal
        isOpen={modalState.open}
        onClose={closeModal}
        appointment={modalState.appointment}
        initialStartAt={modalState.initialStartAt}
        initialEndAt={modalState.initialEndAt}
      />
    </div>
  );
}
