'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CreditCard, Link as LinkIcon, Copy, Check, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

type Tab = 'infinitepay' | 'mercadopago';
type PaymentMethod = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';

interface PaymentModalProps {
  appointmentId: string;
  defaultAmount?: number;
  onClose: () => void;
}

export function PaymentModal({ appointmentId, defaultAmount = 0, onClose }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('infinitepay');
  const [copied, setCopied] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const [manualForm, setManualForm] = useState({
    amount: defaultAmount,
    method: 'CREDIT_CARD' as PaymentMethod,
    installments: 1,
  });

  const [mpForm, setMpForm] = useState({
    amount: defaultAmount,
    maxInstallments: 12,
    description: '',
  });

  const [error, setError] = useState<string | null>(null);

  const manualMutation = useMutation({
    mutationFn: () =>
      api.post('/payments/manual', {
        appointmentId,
        amount: manualForm.amount,
        method: manualForm.method,
        ...(manualForm.method === 'CREDIT_CARD' && manualForm.installments > 1
          ? { installments: manualForm.installments }
          : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', appointmentId] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Erro ao registrar pagamento');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () =>
      api.post<{ checkoutUrl: string }>('/payments/checkout', {
        appointmentId,
        amount: mpForm.amount,
        maxInstallments: mpForm.maxInstallments,
        ...(mpForm.description ? { description: mpForm.description } : {}),
      }),
    onSuccess: (res) => {
      setCheckoutUrl(res.data.checkoutUrl);
      queryClient.invalidateQueries({ queryKey: ['payments', appointmentId] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Erro ao gerar link de pagamento');
    },
  });

  const copyLink = async () => {
    if (!checkoutUrl) return;
    await navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Cobrar Cliente</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['infinitepay', 'mercadopago'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setCheckoutUrl(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-amber-600 border-b-2 border-amber-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'infinitepay' ? '🟦 InfinitePay (manual)' : '🟡 MercadoPago (online)'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {tab === 'infinitepay' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor (R$)</label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Forma de pagamento</label>
                <select
                  value={manualForm.method}
                  onChange={(e) => setManualForm({ ...manualForm, method: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="CREDIT_CARD">Cartão de crédito</option>
                  <option value="DEBIT_CARD">Cartão de débito</option>
                  <option value="PIX">PIX</option>
                  <option value="CASH">Dinheiro</option>
                </select>
              </div>

              {manualForm.method === 'CREDIT_CARD' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Parcelas</label>
                  <select
                    value={manualForm.installments}
                    onChange={(e) => setManualForm({ ...manualForm, installments: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <option key={n} value={n}>
                        {n === 1
                          ? 'À vista'
                          : `${n}x de R$ ${manualForm.amount > 0 ? (manualForm.amount / n).toFixed(2) : '0.00'}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => { setError(null); manualMutation.mutate(); }}
                disabled={manualMutation.isPending || !manualForm.amount}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={16} />
                {manualMutation.isPending ? 'Registrando...' : 'Registrar pagamento'}
              </button>
            </>
          )}

          {tab === 'mercadopago' && (
            <>
              {!checkoutUrl ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor (R$)</label>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={mpForm.amount}
                      onChange={(e) => setMpForm({ ...mpForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Máximo de parcelas</label>
                    <select
                      value={mpForm.maxInstallments}
                      onChange={(e) => setMpForm({ ...mpForm, maxInstallments: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      {[1, 2, 3, 6, 12].map((n) => (
                        <option key={n} value={n}>
                          {n === 1 ? 'À vista' : `Até ${n}x`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição (opcional)</label>
                    <input
                      type="text"
                      value={mpForm.description}
                      onChange={(e) => setMpForm({ ...mpForm, description: e.target.value })}
                      placeholder="Ex: Sessão 2 de 4 — manga completa"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    onClick={() => { setError(null); checkoutMutation.mutate(); }}
                    disabled={checkoutMutation.isPending || !mpForm.amount}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <LinkIcon size={16} />
                    {checkoutMutation.isPending ? 'Gerando link...' : 'Gerar link de pagamento'}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Check size={16} className="text-green-600" />
                    <p className="text-sm text-green-700 font-medium">Link gerado com sucesso!</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500 mb-1">Link de pagamento</p>
                    <p className="text-xs font-mono text-slate-700 break-all">{checkoutUrl}</p>
                  </div>
                  <button
                    onClick={copyLink}
                    className="w-full py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copied ? 'Copiado!' : 'Copiar link'}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl text-sm hover:bg-slate-800 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
