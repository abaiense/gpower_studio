'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Appointment } from './appointment-form';

type PaymentMethod = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER';

interface CommissionResult {
  artistId: string;
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionValue: number;
  totalPrice: number;
  depositAmount: number;
  depositDeducted: number;
  netRevenue: number;
  artistEarns: number;
  studioEarns: number;
}

interface CloseSessionResponse {
  appointment: Appointment;
  commission: CommissionResult;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão Crédito',
  DEBIT_CARD: 'Cartão Débito',
  BANK_TRANSFER: 'Transferência',
};

const PAYMENT_METHODS: PaymentMethod[] = [
  'CASH',
  'PIX',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
];

const paymentItemSchema = z.object({
  method: z.enum(['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER']),
  amount: z.number().min(0, 'Valor inválido'),
});

const closeSessionSchema = z.object({
  totalPrice: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  payments: z.array(paymentItemSchema).min(1, 'Adicione pelo menos um pagamento'),
  notes: z.string().optional(),
});

type CloseSessionFormValues = z.infer<typeof closeSessionSchema>;

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

export function CloseSessionModal({ isOpen, onClose, appointment }: CloseSessionModalProps) {
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [commissionResult, setCommissionResult] = useState<CommissionResult | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<CloseSessionFormValues>({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: {
      totalPrice: appointment.totalPrice ?? 0,
      payments: [{ method: 'PIX', amount: appointment.totalPrice ?? 0 }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'payments',
  });

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  // Focus dialog on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  const closeMutation = useMutation({
    mutationFn: async (data: CloseSessionFormValues) => {
      const res = await api.post<CloseSessionResponse>(`/appointments/${appointment.id}/close`, {
        totalPrice: data.totalPrice,
        payments: data.payments,
        notes: data.notes || undefined,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['cash-report'] });
      setCommissionResult(data.commission);
    },
  });

  const watchedPayments = watch('payments');
  const watchedTotalPrice = watch('totalPrice');

  const paymentsSum = watchedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalMismatch = Math.abs(paymentsSum - (watchedTotalPrice || 0)) > 0.01;

  const handleClose = () => {
    setCommissionResult(null);
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    if (totalMismatch) return;
    await closeMutation.mutateAsync(data);
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label="Fechar sessão"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
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
          <h2 className="text-lg font-semibold text-slate-900">
            {commissionResult ? 'Sessão Fechada!' : 'Fechar Sessão'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
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
          {commissionResult ? (
            /* Success: show commission result */
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                A sessão foi encerrada e a comissão calculada com sucesso.
              </p>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Total</td>
                    <td className="py-2 text-right font-medium text-slate-900">
                      R$ {commissionResult.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Sinal Deduzido</td>
                    <td className="py-2 text-right font-medium text-slate-900">
                      R$ {commissionResult.depositDeducted.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Receita Líquida</td>
                    <td className="py-2 text-right font-medium text-slate-900">
                      R$ {commissionResult.netRevenue.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">Artista Recebe</td>
                    <td className="py-2 text-right font-semibold text-emerald-600">
                      R$ {commissionResult.artistEarns.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">Estúdio Fica</td>
                    <td className="py-2 text-right font-semibold text-amber-600">
                      R$ {commissionResult.studioEarns.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Deposit badge */}
              {appointment.depositAmount && appointment.depositAmount > 0 ? (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700">
                  Sinal pago: <strong>R$ {appointment.depositAmount.toFixed(2)}</strong> — será
                  deduzido do total
                </div>
              ) : null}

              {/* Total price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total (R$) <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="totalPrice"
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  )}
                />
                {errors.totalPrice && (
                  <p className="mt-1 text-xs text-red-500">{errors.totalPrice.message}</p>
                )}
              </div>

              {/* Payments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pagamentos <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ method: 'PIX', amount: 0 })}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded px-2 py-1 transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      {/* Method */}
                      <Controller
                        control={control}
                        name={`payments.${index}.method`}
                        render={({ field: f }) => (
                          <select
                            value={f.value}
                            onChange={f.onChange}
                            className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1"
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m} value={m}>
                                {PAYMENT_METHOD_LABELS[m]}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {/* Amount */}
                      <Controller
                        control={control}
                        name={`payments.${index}.amount`}
                        render={({ field: f }) => (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={f.value ?? ''}
                            onChange={(e) =>
                              f.onChange(
                                e.target.value === '' ? 0 : parseFloat(e.target.value),
                              )
                            }
                            placeholder="0.00"
                            className="w-28 rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        )}
                      />
                      {/* Remove button */}
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="rounded-md p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Remover pagamento"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Running total */}
                <div
                  className={`mt-2 text-sm font-medium ${totalMismatch ? 'text-red-600' : 'text-slate-600'}`}
                >
                  Total dos pagamentos: R$ {paymentsSum.toFixed(2)}
                  {totalMismatch && (
                    <span className="ml-2 text-xs font-normal">
                      (deve ser igual ao valor total)
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Notas sobre a sessão..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Error feedback */}
              {closeMutation.isError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                  Ocorreu um erro ao fechar a sessão. Tente novamente.
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={closeMutation.isPending || totalMismatch}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {closeMutation.isPending ? 'Fechando...' : 'Fechar Sessão'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
