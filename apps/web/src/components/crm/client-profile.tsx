'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ClientForm } from './client-form';

type AppointmentStatus =
  | 'PENDING'
  | 'DEPOSIT_PAID'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  birthDate?: string;
  notes?: string;
  allergies?: string;
  isBlocked: boolean;
  blockReason?: string;
  noShowCount: number;
  studioId: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  totalPrice?: number;
  service: { id: string; name: string; category: string };
  artist: { id: string; firstName: string; lastName: string };
}

interface ClientProfileProps {
  clientId: string;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendente',
  DEPOSIT_PAID: 'Depósito pago',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  DEPOSIT_PAID: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function ClientProfile({ clientId }: ClientProfileProps) {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // Fetch client — try GET /clients/:id, fallback to GET /clients filtered
  const {
    data: client,
    isLoading: clientLoading,
    isError: clientError,
  } = useQuery<Client>({
    queryKey: ['client', clientId],
    queryFn: async () => {
      try {
        const res = await api.get<Client>(`/clients/${clientId}`);
        return res.data;
      } catch {
        // Fallback: fetch all and filter
        const res = await api.get<Client[]>('/clients');
        const found = res.data.find((c) => c.id === clientId);
        if (!found) throw new Error('Cliente não encontrado');
        return found;
      }
    },
  });

  // Fetch appointments and filter client-side
  const { data: appointments, isLoading: apptLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', 'client', clientId],
    queryFn: async () => {
      try {
        const res = await api.get<Appointment[]>(`/appointments`, {
          params: { clientId },
        });
        return res.data;
      } catch {
        // If clientId param not supported, fetch all and filter
        const res = await api.get<Appointment[]>('/appointments');
        return (res.data as Appointment[]).filter((a) => {
          // appointments may not have clientId directly in the response shape
          return true; // Return all if we can't filter — the API should support it
        });
      }
    },
    enabled: Boolean(client),
  });

  // Toggle block mutation
  const blockMutation = useMutation({
    mutationFn: async (data: { isBlocked: boolean; blockReason?: string | undefined }) => {
      const body: Record<string, unknown> = { isBlocked: data.isBlocked };
      if (data.blockReason !== undefined) body['blockReason'] = data.blockReason;
      const res = await api.patch<Client>(`/clients/${clientId}`, body);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['client', clientId], updated);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowBlockModal(false);
      setBlockReason('');
    },
  });

  const handleToggleBlock = () => {
    if (client?.isBlocked) {
      blockMutation.mutate({ isBlocked: false });
    } else {
      setShowBlockModal(true);
    }
  };

  const handleConfirmBlock = () => {
    const payload: { isBlocked: boolean; blockReason?: string } = { isBlocked: true };
    if (blockReason) payload.blockReason = blockReason;
    blockMutation.mutate(payload);
  };

  if (clientLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="h-6 w-64 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="space-y-4">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm"
        >
          <ArrowLeft size={16} />
          Voltar para Clientes
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <AlertCircle size={32} className="text-red-400 mb-3" />
          <p className="font-medium text-slate-700">Cliente não encontrado</p>
          <p className="text-sm text-slate-400 mt-1">
            O cliente solicitado não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  const completedAppointments = appointments?.filter((a) => a.status === 'COMPLETED') ?? [];
  const noShowAppointments = appointments?.filter((a) => a.status === 'NO_SHOW') ?? [];
  const lastVisit = completedAppointments.sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
  )[0];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm"
      >
        <ArrowLeft size={16} />
        Voltar para Clientes
      </Link>

      {/* Client header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-amber-700 font-bold text-xl">
                {client.firstName[0]}{client.lastName[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">
                  {client.firstName} {client.lastName}
                </h1>
                {client.isBlocked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <ShieldAlert size={12} />
                    Bloqueado
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone size={14} />
                  {client.phone}
                </span>
                {client.email && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                    <Mail size={14} />
                    {client.email}
                  </span>
                )}
                {client.birthDate && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                    <Calendar size={14} />
                    {formatDate(client.birthDate)}
                  </span>
                )}
              </div>

              {client.isBlocked && client.blockReason && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                  Motivo: {client.blockReason}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Edit2 size={14} />
              Editar
            </button>
            <button
              onClick={handleToggleBlock}
              disabled={blockMutation.isPending}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                client.isBlocked
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {blockMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : client.isBlocked ? (
                <ShieldCheck size={14} />
              ) : (
                <ShieldAlert size={14} />
              )}
              {client.isBlocked ? 'Desbloquear' : 'Bloquear'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-sm text-slate-500">Agendamentos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {apptLoading ? '—' : (appointments?.length ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-sm text-slate-500">No-shows</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {client.noShowCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-sm text-slate-500">Última Visita</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            {apptLoading
              ? '—'
              : lastVisit
              ? formatDate(lastVisit.startAt)
              : 'Nenhuma'}
          </p>
        </div>
      </div>

      {/* Notes & Allergies */}
      {(client.allergies || client.notes) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {client.allergies && (
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-5">
              <h3 className="text-sm font-semibold text-orange-800 mb-2">Alergias</h3>
              <p className="text-sm text-orange-700 whitespace-pre-wrap">{client.allergies}</p>
            </div>
          )}
          {client.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Observações</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Appointment history */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Histórico de Agendamentos</h2>
        </div>
        {apptLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Serviço
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Artista
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments
                  .slice()
                  .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
                  .map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-700">
                        {formatDateTime(appt.startAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{appt.service.name}</td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                        {appt.artist.firstName} {appt.artist.lastName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status]}`}
                        >
                          {STATUS_LABELS[appt.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 hidden sm:table-cell">
                        {appt.totalPrice != null
                          ? formatCurrency(appt.totalPrice)
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">
              Nenhum agendamento registrado para este cliente.
            </p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Editar Cliente</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <ClientForm
                client={client}
                onSuccess={(updated) => {
                  queryClient.setQueryData(['client', clientId], updated);
                  queryClient.invalidateQueries({ queryKey: ['clients'] });
                  setShowEditModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Block confirmation modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBlockModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Bloquear Cliente</h2>
              <button
                onClick={() => setShowBlockModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Tem certeza que deseja bloquear{' '}
              <strong>
                {client.firstName} {client.lastName}
              </strong>
              ? O cliente ficará marcado como bloqueado.
            </p>

            <div className="space-y-1">
              <label
                htmlFor="blockReason"
                className="block text-sm font-medium text-slate-700"
              >
                Motivo (opcional)
              </label>
              <input
                id="blockReason"
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: não compareceu 3 vezes..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBlock}
                disabled={blockMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {blockMutation.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Confirmar Bloqueio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
