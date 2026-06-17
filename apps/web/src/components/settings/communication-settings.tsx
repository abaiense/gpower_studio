'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { communicationSchema, type CommunicationFormData } from '@/lib/validations/settings.schema';

interface StudioSettings {
  id: string;
  name: string;
  depositEnabled: boolean;
  depositType: 'PERCENTAGE' | 'FIXED';
  depositValue: number;
  depositExpiryHours: number;
  whatsappEnabled: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  emailEnabled: boolean;
  emailFromName?: string;
  emailFromAddress?: string;
}

const AUTOMATIONS = [
  { event: 'Confirmação de agendamento', whatsapp: true, email: true },
  { event: 'Lembrete 24h antes', whatsapp: true, email: true },
  { event: 'Solicitação de depósito', whatsapp: true, email: true },
  { event: 'Aftercare (dia 1)', whatsapp: true, email: true },
] as const;

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
        checked ? 'bg-amber-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function CommunicationSettings() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const { data: settings, isLoading } = useQuery<StudioSettings>({
    queryKey: ['studio-settings'],
    queryFn: async () => {
      const { data } = await api.get<StudioSettings>('/studios/settings');
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      whatsappEnabled: false,
      whatsappPhoneNumberId: '',
      whatsappAccessToken: '',
      emailEnabled: false,
      emailFromName: '',
      emailFromAddress: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        whatsappEnabled: settings.whatsappEnabled,
        whatsappPhoneNumberId: settings.whatsappPhoneNumberId ?? '',
        whatsappAccessToken: settings.whatsappAccessToken ?? '',
        emailEnabled: settings.emailEnabled,
        emailFromName: settings.emailFromName ?? '',
        emailFromAddress: settings.emailFromAddress ?? '',
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CommunicationFormData) => {
      const { data: result } = await api.patch<StudioSettings>('/studios/settings', data);
      return result;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['studio-settings'], updated);
      setSuccessMsg('Configurações salvas com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  const whatsappEnabled = watch('whatsappEnabled');
  const emailEnabled = watch('emailEnabled');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate className="space-y-6">
      {/* WhatsApp section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">WhatsApp</h2>
          <Controller
            control={control}
            name="whatsappEnabled"
            render={({ field }) => (
              <Toggle checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {whatsappEnabled && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label htmlFor="whatsappPhoneNumberId" className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number ID
              </label>
              <input
                id="whatsappPhoneNumberId"
                type="text"
                placeholder="Número obtido no Meta Business Manager"
                {...register('whatsappPhoneNumberId')}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label htmlFor="whatsappAccessToken" className="block text-sm font-medium text-slate-700 mb-1.5">
                Access Token
              </label>
              <div className="relative">
                <input
                  id="whatsappAccessToken"
                  type={showToken ? 'text' : 'password'}
                  {...register('whatsappAccessToken')}
                  className="border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              <p className="text-xs text-slate-600">
                Configure seu número no Meta Business Manager. Templates devem ser aprovados pela
                Meta antes do uso.
              </p>
              <span className="text-xs text-amber-600 font-medium cursor-pointer hover:text-amber-700">
                Ver documentação →
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Email section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">E-mail</h2>
          <Controller
            control={control}
            name="emailEnabled"
            render={({ field }) => (
              <Toggle checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {emailEnabled && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label htmlFor="emailFromName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome do remetente
              </label>
              <input
                id="emailFromName"
                type="text"
                {...register('emailFromName')}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label htmlFor="emailFromAddress" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail do remetente
              </label>
              <input
                id="emailFromAddress"
                type="email"
                {...register('emailFromAddress')}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {errors.emailFromAddress && (
                <p className="text-red-600 text-xs mt-1">{errors.emailFromAddress.message}</p>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600">
                Certifique-se de verificar o domínio no SendGrid para evitar spam.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Automations info card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Automações</h2>
        <p className="text-sm text-slate-500 mb-4">
          Notificações enviadas automaticamente nos seguintes eventos:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-slate-600 font-medium">Evento</th>
                <th className="text-center py-2 px-4 text-slate-600 font-medium">WhatsApp</th>
                <th className="text-center py-2 px-4 text-slate-600 font-medium">E-mail</th>
              </tr>
            </thead>
            <tbody>
              {AUTOMATIONS.map(({ event, whatsapp, email }) => (
                <tr key={event} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pr-4 text-slate-700">{event}</td>
                  <td className="py-2.5 px-4 text-center">
                    {whatsapp ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {email ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {(isSubmitting || mutation.isPending) && (
            <Loader2 size={14} className="animate-spin" />
          )}
          Salvar alterações
        </button>

        {successMsg && (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-4 py-2 text-sm">
            {successMsg}
          </span>
        )}

        {mutation.isError && (
          <span className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm">
            Erro ao salvar. Tente novamente.
          </span>
        )}
      </div>
    </form>
  );
}
