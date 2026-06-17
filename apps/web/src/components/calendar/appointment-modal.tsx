'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppointmentForm } from './appointment-form';
import type { Appointment, AppointmentStatus } from './appointment-form';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null | undefined;
  initialStartAt?: string | undefined;
  initialEndAt?: string | undefined;
}

interface SubmitPayload {
  clientId: string;
  artistId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status?: AppointmentStatus | undefined;
  notes?: string | undefined;
  totalPrice?: number | undefined;
}

interface CreatePayload extends SubmitPayload {}

interface UpdatePayload extends SubmitPayload {
  id: string;
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  initialStartAt,
  initialEndAt,
}: AppointmentModalProps) {
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap: focus dialog on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: CreatePayload) => {
      const res = await api.post('/appointments', data);
      return res.data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...rest }: UpdatePayload) => {
      const res = await api.patch(`/appointments/${id}`, rest);
      return res.data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
  });

  const handleSubmit = async (data: {
    clientId: string;
    artistId: string;
    serviceId: string;
    startAt: string;
    endAt: string;
    status?: string | undefined;
    notes?: string | undefined;
    totalPrice?: number | undefined;
  }) => {
    // Cast status to AppointmentStatus since form validates it as such
    const typedStatus = data.status as AppointmentStatus | undefined;

    if (appointment) {
      const payload: UpdatePayload = {
        id: appointment.id,
        clientId: data.clientId,
        artistId: data.artistId,
        serviceId: data.serviceId,
        startAt: data.startAt,
        endAt: data.endAt,
      };
      if (typedStatus) payload.status = typedStatus;
      if (data.notes) payload.notes = data.notes;
      if (data.totalPrice !== undefined) payload.totalPrice = data.totalPrice;
      await updateMutation.mutateAsync(payload);
    } else {
      const payload: CreatePayload = {
        clientId: data.clientId,
        artistId: data.artistId,
        serviceId: data.serviceId,
        startAt: data.startAt,
        endAt: data.endAt,
      };
      if (typedStatus) payload.status = typedStatus;
      if (data.notes) payload.notes = data.notes;
      if (data.totalPrice !== undefined) payload.totalPrice = data.totalPrice;
      await createMutation.mutateAsync(payload);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;
    if (!window.confirm('Remover agendamento?')) return;
    await deleteMutation.mutateAsync(appointment.id);
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label={appointment ? 'Editar agendamento' : 'Novo agendamento'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-white shadow-2xl outline-none max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Fechar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <AppointmentForm
            appointment={appointment ?? null}
            initialStartAt={initialStartAt}
            initialEndAt={initialEndAt}
            onSubmit={handleSubmit}
            onDelete={appointment ? handleDelete : undefined}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
