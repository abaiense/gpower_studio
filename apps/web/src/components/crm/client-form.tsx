'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { clientSchema, type ClientFormData } from '@/lib/validations/client.schema';

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

interface ClientFormProps {
  client?: Client;
  onSuccess?: (client: Client) => void;
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(client);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: client?.firstName ?? '',
      lastName: client?.lastName ?? '',
      phone: client?.phone ?? '',
      email: client?.email ?? '',
      birthDate: client?.birthDate ? client.birthDate.slice(0, 10) : '',
      notes: client?.notes ?? '',
      allergies: client?.allergies ?? '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setServerError(null);
    try {
      const payload = {
        ...data,
        email: data.email || undefined,
        birthDate: data.birthDate || undefined,
        notes: data.notes || undefined,
        allergies: data.allergies || undefined,
      };

      let saved: Client;
      if (isEdit && client) {
        const res = await api.patch<Client>(`/clients/${client.id}`, payload);
        saved = res.data;
      } else {
        const res = await api.post<Client>('/clients', payload);
        saved = res.data;
      }

      if (onSuccess) {
        onSuccess(saved);
      } else {
        router.push(`/clientes/${saved.id}`);
      }
    } catch {
      setServerError('Erro ao salvar cliente. Verifique os dados e tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="João"
            {...register('firstName')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
            Sobrenome <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Silva"
            {...register('lastName')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
          Telefone <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+55 11 99999-0000"
          {...register('phone')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="joao@email.com"
          {...register('email')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Birth Date */}
      <div className="space-y-1">
        <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">
          Data de Nascimento
        </label>
        <input
          id="birthDate"
          type="date"
          {...register('birthDate')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
          disabled={isSubmitting}
        />
        {errors.birthDate && (
          <p className="text-red-600 text-xs mt-1">{errors.birthDate.message}</p>
        )}
      </div>

      {/* Allergies */}
      <div className="space-y-1">
        <label htmlFor="allergies" className="block text-sm font-medium text-slate-700">
          Alergias
          <span className="ml-1 text-xs text-slate-400">(importante para segurança)</span>
        </label>
        <textarea
          id="allergies"
          rows={2}
          placeholder="Ex: látex, anestésico, metais..."
          {...register('allergies')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50 resize-none"
          disabled={isSubmitting}
        />
        {errors.allergies && (
          <p className="text-red-600 text-xs mt-1">{errors.allergies.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Observações
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Preferências, histórico, informações adicionais..."
          {...register('notes')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50 resize-none"
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="text-red-600 text-xs mt-1">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
        </button>
      </div>
    </form>
  );
}
