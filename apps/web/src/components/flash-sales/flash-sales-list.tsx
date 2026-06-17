'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { FlashSaleForm } from './flash-sale-form';

type FlashSlotStatus = 'OPEN' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';

interface FlashSlot {
  id: string;
  title: string;
  originalPrice: number;
  discountPrice: number;
  sessionAt: string;
  claimDeadline: string;
  status: FlashSlotStatus;
  claimToken: string;
  artist?: { firstName: string; lastName: string } | null;
  service?: { name: string } | null;
  claimedByClient?: { firstName: string; lastName: string } | null;
}

function StatusBadge({ status }: { status: FlashSlotStatus }) {
  const map: Record<FlashSlotStatus, { label: string; className: string; Icon: React.ElementType }> = {
    OPEN: { label: 'Aberto', className: 'bg-green-100 text-green-700', Icon: Clock },
    CLAIMED: { label: 'Reservado', className: 'bg-blue-100 text-blue-600', Icon: CheckCircle2 },
    EXPIRED: { label: 'Expirado', className: 'bg-slate-100 text-slate-500', Icon: XCircle },
    CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-600', Icon: XCircle },
  };
  const { label, className, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

const PUBLIC_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';

export function FlashSalesList() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: slots, isLoading, isError } = useQuery<FlashSlot[]>({
    queryKey: ['flash-slots'],
    queryFn: async () => (await api.get<FlashSlot[]>('/flash-slots')).data,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/flash-slots/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flash-slots'] }),
  });

  const copyLink = async (token: string, id: string) => {
    await navigator.clipboard.writeText(`${PUBLIC_URL}/flash/${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flash Sales</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Publique slots relâmpago com desconto para preencher horários cancelados
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          Novo Flash Sale
        </button>
      </div>

      {showForm && (
        <FlashSaleForm
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['flash-slots'] });
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isError ? (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle size={32} className="text-red-400 mb-3" />
          <p className="text-slate-600 font-medium">Erro ao carregar flash sales</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : slots && slots.length > 0 ? (
        <div className="space-y-3">
          {slots.map((slot) => (
            <div key={slot.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-sm">{slot.title}</span>
                      <StatusBadge status={slot.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        <span className="line-through text-slate-400">
                          R$ {slot.originalPrice.toFixed(2)}
                        </span>
                        {' → '}
                        <span className="text-green-600 font-semibold">
                          R$ {slot.discountPrice.toFixed(2)}
                        </span>
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(slot.sessionAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {slot.artist && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {slot.artist.firstName} {slot.artist.lastName}
                        {slot.service ? ` · ${slot.service.name}` : ''}
                      </p>
                    )}
                    {slot.claimedByClient && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        Reservado por: {slot.claimedByClient.firstName}{' '}
                        {slot.claimedByClient.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {slot.status === 'OPEN' && (
                    <>
                      <button
                        onClick={() => copyLink(slot.claimToken, slot.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {copiedId === slot.id ? (
                          <Check size={12} className="text-green-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                        {copiedId === slot.id ? 'Copiado!' : 'Copiar link'}
                      </button>
                      <button
                        onClick={() => cancelMutation.mutate(slot.id)}
                        disabled={cancelMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 text-center">
          <Zap size={40} className="text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">Nenhum flash sale criado</p>
          <p className="text-slate-400 text-sm mt-1">
            Publique slots relâmpago para preencher horários cancelados.
          </p>
        </div>
      )}
    </div>
  );
}
