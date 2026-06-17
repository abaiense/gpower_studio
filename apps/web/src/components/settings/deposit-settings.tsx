'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { depositSchema, type DepositFormData } from '@/lib/validations/settings.schema';

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

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function computeDeposit(
  depositType: 'PERCENTAGE' | 'FIXED',
  depositValue: number,
  sessionValue = 500,
): string {
  if (depositType === 'PERCENTAGE') {
    const amount = (sessionValue * depositValue) / 100;
    return formatCurrency(amount);
  }
  return formatCurrency(depositValue);
}

export function DepositSettings() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      depositEnabled: false,
      depositType: 'PERCENTAGE',
      depositValue: 50,
      depositExpiryHours: 48,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        depositEnabled: settings.depositEnabled,
        depositType: settings.depositType,
        depositValue: settings.depositValue,
        depositExpiryHours: settings.depositExpiryHours,
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: async (data: DepositFormData) => {
      const { data: result } = await api.patch<StudioSettings>('/studios/settings', data);
      return result;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['studio-settings'], updated);
      setSuccessMsg('Configurações salvas com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  const depositEnabled = watch('depositEnabled');
  const depositType = watch('depositType');
  const depositValue = watch('depositValue');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate className="space-y-6">
      {/* Toggle row */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Cobrar depósito</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Exige pagamento de sinal para confirmar agendamentos.
            </p>
          </div>
          <Controller
            control={control}
            name="depositEnabled"
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  field.value ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                    field.value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            )}
          />
        </div>
      </div>

      {/* Deposit config (only when enabled) */}
      {depositEnabled && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Configurações do depósito</h2>

          {/* Deposit type */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">Tipo de depósito</p>
            <div className="flex gap-4">
              {(
                [
                  { value: 'PERCENTAGE', label: 'Percentual (%)' },
                  { value: 'FIXED', label: 'Valor fixo (R$)' },
                ] as const
              ).map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    {...register('depositType')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deposit value */}
          <div>
            <label htmlFor="depositValue" className="block text-sm font-medium text-slate-700 mb-1.5">
              {depositType === 'PERCENTAGE' ? 'Percentual (%)' : 'Valor (R$)'}
            </label>
            <input
              id="depositValue"
              type="number"
              step={depositType === 'PERCENTAGE' ? '1' : '0.01'}
              min={0}
              max={depositType === 'PERCENTAGE' ? 100 : undefined}
              {...register('depositValue', { valueAsNumber: true })}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {errors.depositValue && (
              <p className="text-red-600 text-xs mt-1">{errors.depositValue.message}</p>
            )}
          </div>

          {/* Expiry hours */}
          <div>
            <label htmlFor="depositExpiryHours" className="block text-sm font-medium text-slate-700 mb-1.5">
              Cancelar automaticamente após{' '}
              <span className="text-amber-600 font-semibold">{watch('depositExpiryHours')}</span>{' '}
              horas sem pagamento
            </label>
            <input
              id="depositExpiryHours"
              type="number"
              min={1}
              max={168}
              {...register('depositExpiryHours', { valueAsNumber: true })}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {errors.depositExpiryHours && (
              <p className="text-red-600 text-xs mt-1">{errors.depositExpiryHours.message}</p>
            )}
          </div>

          {/* Preview card */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800 mb-1">Pré-visualização</p>
            <p className="text-sm text-amber-700">
              Para uma sessão de R$500,00: sinal de{' '}
              <span className="font-semibold">
                R${computeDeposit(depositType, depositValue ?? 0)}
              </span>
            </p>
          </div>
        </div>
      )}

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
