'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type AppointmentStatus =
  | 'PENDING'
  | 'DEPOSIT_PAID'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

interface Artist {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface Service {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  basePrice?: number;
  isActive: boolean;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes?: string;
  totalPrice?: number;
  depositAmount?: number;
  clientId: string;
  artistId: string;
  serviceId: string;
  studioId: string;
  projectId?: string;
  client: { id: string; firstName: string; lastName: string; phone: string };
  artist: { id: string; firstName: string; lastName: string };
  service: { id: string; name: string; category: string; durationMin: number };
}

const schema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  artistId: z.string().min(1, 'Selecione um artista'),
  serviceId: z.string().min(1, 'Selecione um serviço'),
  date: z.string().min(1, 'Informe a data'),
  startTime: z.string().min(1, 'Informe o horário de início'),
  endTime: z.string().min(1, 'Informe o horário de término'),
  status: z.string().optional(),
  notes: z.string().optional(),
  totalPrice: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AppointmentFormProps {
  appointment?: Appointment | null | undefined;
  initialStartAt?: string | undefined;
  initialEndAt?: string | undefined;
  onSubmit: (data: {
    clientId: string;
    artistId: string;
    serviceId: string;
    startAt: string;
    endAt: string;
    status?: string | undefined;
    notes?: string | undefined;
    totalPrice?: number | undefined;
  }) => Promise<void>;
  onDelete?: (() => Promise<void>) | undefined;
  isSubmitting: boolean;
}

function isoToDate(iso: string): string {
  return iso.slice(0, 10);
}

function isoToTime(iso: string): string {
  return iso.slice(11, 16);
}

function buildIso(date: string, time: string): string {
  return `${date}T${time}:00.000Z`;
}

export function AppointmentForm({
  appointment,
  initialStartAt,
  initialEndAt,
  onSubmit,
  onDelete,
  isSubmitting,
}: AppointmentFormProps) {
  const isEdit = Boolean(appointment);

  const defaultDate = appointment
    ? isoToDate(appointment.startAt)
    : initialStartAt
      ? isoToDate(initialStartAt)
      : '';
  const defaultStartTime = appointment
    ? isoToTime(appointment.startAt)
    : initialStartAt
      ? isoToTime(initialStartAt)
      : '';
  const defaultEndTime = appointment
    ? isoToTime(appointment.endAt)
    : initialEndAt
      ? isoToTime(initialEndAt)
      : '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: appointment?.clientId ?? '',
      artistId: appointment?.artistId ?? '',
      serviceId: appointment?.serviceId ?? '',
      date: defaultDate,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      status: appointment?.status ?? 'PENDING',
      notes: appointment?.notes ?? '',
      totalPrice: appointment?.totalPrice ? String(appointment.totalPrice) : '',
    },
  });

  // Client search state
  const [clientSearch, setClientSearch] = useState(
    appointment ? `${appointment.client.firstName} ${appointment.client.lastName}` : '',
  );
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(clientSearch), 300);
    return () => clearTimeout(timer);
  }, [clientSearch]);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients', debouncedSearch],
    queryFn: async () => {
      const res = await api.get('/clients', { params: { search: debouncedSearch } });
      return res.data;
    },
    enabled: debouncedSearch.length >= 2 && clientDropdownOpen,
  });

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      const res = await api.get('/artists');
      return res.data;
    },
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data;
    },
  });

  const watchedArtistId = watch('artistId');
  const watchedDate = watch('date');
  const watchedServiceId = watch('serviceId');
  const watchedStartTime = watch('startTime');

  // Auto-calc end time from service duration
  useEffect(() => {
    if (!watchedStartTime || !watchedServiceId) return;
    const selectedService = services.find((s) => s.id === watchedServiceId);
    if (!selectedService) return;
    const parts = watchedStartTime.split(':');
    const h = parseInt(parts[0] ?? '0', 10);
    const m = parseInt(parts[1] ?? '0', 10);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + selectedService.durationMin;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    setValue('endTime', endTime);
  }, [watchedStartTime, watchedServiceId, services, setValue]);

  // Availability hint
  const { data: availability = [] } = useQuery<{ startAt: string; endAt: string }[]>({
    queryKey: ['availability', watchedArtistId, watchedDate],
    queryFn: async () => {
      const res = await api.get('/appointments/availability', {
        params: { artistId: watchedArtistId, date: watchedDate },
      });
      return res.data;
    },
    enabled: Boolean(watchedArtistId) && Boolean(watchedDate),
  });

  const handleFormSubmit = handleSubmit(async (values) => {
    // Treat times as local time for simplicity
    const startAt = `${values.date}T${values.startTime}:00`;
    const endAt = `${values.date}T${values.endTime}:00`;
    const payload: Parameters<typeof onSubmit>[0] = {
      clientId: values.clientId,
      artistId: values.artistId,
      serviceId: values.serviceId,
      startAt,
      endAt,
    };
    if (values.status) payload.status = values.status;
    if (values.notes) payload.notes = values.notes;
    if (values.totalPrice) payload.totalPrice = parseFloat(values.totalPrice);
    await onSubmit(payload);
  });

  const statusOptions: AppointmentStatus[] = [
    'PENDING',
    'DEPOSIT_PAID',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ];

  const statusLabels: Record<AppointmentStatus, string> = {
    PENDING: 'Pendente',
    DEPOSIT_PAID: 'Sinal Pago',
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Não Compareceu',
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* Client search */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={clientSearch}
          onChange={(e) => {
            setClientSearch(e.target.value);
            setClientDropdownOpen(true);
            if (!e.target.value) setValue('clientId', '');
          }}
          onFocus={() => setClientDropdownOpen(true)}
          placeholder="Buscar cliente..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input type="hidden" {...register('clientId')} />
        {clientDropdownOpen && clients.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-auto">
            {clients.map((c) => (
              <li
                key={c.id}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50"
                onMouseDown={() => {
                  setValue('clientId', c.id);
                  setClientSearch(`${c.firstName} ${c.lastName}`);
                  setClientDropdownOpen(false);
                }}
              >
                {c.firstName} {c.lastName}
                {c.phone && <span className="ml-2 text-gray-400">{c.phone}</span>}
              </li>
            ))}
          </ul>
        )}
        {errors.clientId && (
          <p className="mt-1 text-xs text-red-500">{errors.clientId.message}</p>
        )}
      </div>

      {/* Artist */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Artista <span className="text-red-500">*</span>
        </label>
        <select
          {...register('artistId')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecione...</option>
          {artists
            .filter((a) => a.isActive)
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </option>
            ))}
        </select>
        {errors.artistId && (
          <p className="mt-1 text-xs text-red-500">{errors.artistId.message}</p>
        )}
      </div>

      {/* Service */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Serviço <span className="text-red-500">*</span>
        </label>
        <select
          {...register('serviceId')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecione...</option>
          {services
            .filter((s) => s.isActive)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMin}min)
                {s.basePrice ? ` — R$ ${s.basePrice.toFixed(2)}` : ''}
              </option>
            ))}
        </select>
        {errors.serviceId && (
          <p className="mt-1 text-xs text-red-500">{errors.serviceId.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('date')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
      </div>

      {/* Availability hint */}
      {availability.length > 0 && (
        <div className="rounded-md bg-indigo-50 p-2">
          <p className="text-xs font-medium text-indigo-700 mb-1">Horários disponíveis:</p>
          <div className="flex flex-wrap gap-1">
            {availability.map((slot) => (
              <button
                key={slot.startAt}
                type="button"
                onClick={() => {
                  const st = isoToTime(slot.startAt);
                  const et = isoToTime(slot.endAt);
                  setValue('startTime', st);
                  setValue('endTime', et);
                }}
                className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800 hover:bg-indigo-200"
              >
                {isoToTime(slot.startAt)} – {isoToTime(slot.endAt)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start / End time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Início <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            {...register('startTime')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.startTime && (
            <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Término <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            {...register('endTime')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.endTime && (
            <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      {/* Status (edit only) */}
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            {...register('status')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Notas sobre o agendamento..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Total price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register('totalPrice')}
          placeholder="0.00"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        {isEdit && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Remover
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : isEdit ? 'Atualizar' : 'Agendar'}
        </button>
      </div>
    </form>
  );
}

// Re-export types for use by sibling components
export type { Appointment, Artist, Service, Client, AppointmentStatus };
