'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Zap,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

const PUBLIC_API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3333';

interface FlashSlot {
  id: string;
  title: string;
  description?: string | null | undefined;
  originalPrice: number;
  discountPrice: number;
  sessionAt: string;
  claimDeadline: string;
  status: 'OPEN' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';
  artist?: { firstName: string; lastName: string } | null | undefined;
  service?: { name: string } | null | undefined;
}

interface ClaimResult {
  message: string;
  appointmentId: string;
}

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${PUBLIC_API}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function postPublic<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${PUBLIC_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

interface FlashClaimPageProps {
  token: string;
}

export function FlashClaimPage({ token }: FlashClaimPageProps) {
  const [phone, setPhone] = useState('');
  const [claimed, setClaimed] = useState(false);

  const {
    data: slot,
    isLoading,
    isError,
    error,
  } = useQuery<FlashSlot>({
    queryKey: ['flash-slot', token],
    queryFn: () => fetchPublic<FlashSlot>(`/public/flash/${token}`),
    retry: false,
  });

  const claimMutation = useMutation<ClaimResult, Error>({
    mutationFn: () =>
      postPublic<ClaimResult>(`/public/flash/${token}/claim`, { phone }),
    onSuccess: () => setClaimed(true),
  });

  const discount = slot
    ? Math.round(
        ((slot.originalPrice - slot.discountPrice) / slot.originalPrice) * 100,
      )
    : 0;

  if (claimed) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Slot reservado!</h1>
          <p className="text-slate-500 text-sm">
            O estúdio entrará em contato para confirmar o agendamento.
          </p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw size={24} className="text-amber-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (isError || !slot) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Link inválido</h1>
          <p className="text-slate-500 text-sm">
            {(error as Error | null)?.message ?? 'Este flash sale não está disponível.'}
          </p>
        </div>
      </Layout>
    );
  }

  const notAvailable = slot.status !== 'OPEN';

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-3">
            <Zap size={24} className="text-amber-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Zap size={11} />
            FLASH SALE — {discount}% OFF
          </div>
          <h1 className="text-xl font-bold text-slate-900">{slot.title}</h1>
          {slot.description != null && (
            <p className="text-slate-500 text-sm mt-1">{slot.description}</p>
          )}
        </div>

        {/* Price card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">De</p>
              <p className="text-lg text-slate-400 line-through">
                R$ {slot.originalPrice.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-600 font-medium mb-0.5">Por apenas</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {slot.discountPrice.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={14} className="text-slate-400" />
              <span>
                Sessão:{' '}
                {new Date(slot.sessionAt).toLocaleString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {slot.artist != null && (
              <div className="text-sm text-slate-500">
                Artista: {slot.artist.firstName} {slot.artist.lastName}
                {slot.service != null ? ` · ${slot.service.name}` : ''}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
              <Clock size={12} />
              Reservar até:{' '}
              {new Date(slot.claimDeadline).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Status / Claim */}
        {notAvailable ? (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-sm font-medium text-slate-600">
              {slot.status === 'CLAIMED'
                ? '😔 Este slot já foi reservado por outro cliente.'
                : slot.status === 'EXPIRED'
                  ? '⏰ O prazo para reservar este slot expirou.'
                  : '❌ Este slot foi cancelado.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Seu telefone (cadastrado no estúdio)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 99999-9999"
                className="w-full px-3 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">
                Use o mesmo número que você forneceu ao estúdio.
              </p>
            </div>

            {claimMutation.isError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {claimMutation.error instanceof Error
                  ? claimMutation.error.message
                  : 'Erro ao reservar. Tente novamente.'}
              </div>
            )}

            <button
              onClick={() => claimMutation.mutate()}
              disabled={!phone.trim() || claimMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-base transition-colors"
            >
              <Zap size={20} />
              {claimMutation.isPending ? 'Reservando...' : 'Quero esse slot!'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">G</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">GPower Studio</span>
        </div>
      </div>
      {children}
    </div>
  );
}
