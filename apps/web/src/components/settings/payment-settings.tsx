'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

interface PaymentConfig {
  mpConfigured: boolean;
  mpPublicKey: string | null;
}

export function PaymentSettings() {
  const queryClient = useQueryClient();
  const [showToken, setShowToken] = useState(false);
  const [form, setForm] = useState({ mpAccessToken: '', mpPublicKey: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: config, isLoading } = useQuery<PaymentConfig>({
    queryKey: ['payment-config'],
    queryFn: async () => (await api.get<PaymentConfig>('/studios/me/payment-config')).data,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      api.patch('/studios/me/payment-config', {
        ...(form.mpAccessToken ? { mpAccessToken: form.mpAccessToken } : {}),
        ...(form.mpPublicKey ? { mpPublicKey: form.mpPublicKey } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-config'] });
      setSaved(true);
      setForm({ mpAccessToken: '', mpPublicKey: '' });
      setError(null);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Erro ao salvar');
    },
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">MercadoPago</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure sua conta MercadoPago para aceitar pagamentos online com parcelamento.
        </p>
      </div>

      {!isLoading && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
          config?.mpConfigured ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'
        }`}>
          {config?.mpConfigured ? <Check size={16} /> : <AlertCircle size={16} />}
          {config?.mpConfigured ? 'MercadoPago configurado' : 'MercadoPago não configurado'}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <Check size={16} />
          Configurações salvas com sucesso!
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Access Token{' '}
            {config?.mpConfigured && (
              <span className="text-green-600 text-xs font-normal">
                (configurado — preencha apenas para atualizar)
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={form.mpAccessToken}
              onChange={(e) => setForm({ ...form, mpAccessToken: e.target.value })}
              placeholder="APP_USR-xxxx..."
              className="w-full pr-10 px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Encontre em mercadopago.com.br/developers/panel
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Public Key</label>
          <input
            type="text"
            value={form.mpPublicKey}
            onChange={(e) => setForm({ ...form, mpPublicKey: e.target.value })}
            placeholder="APP_USR-xxxx..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => { setError(null); saveMutation.mutate(); }}
            disabled={saveMutation.isPending || (!form.mpAccessToken && !form.mpPublicKey)}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
