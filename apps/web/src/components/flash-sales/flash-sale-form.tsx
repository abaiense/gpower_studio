'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Artist {
  id: string;
  firstName: string;
  lastName: string;
}

interface Service {
  id: string;
  name: string;
}

interface FlashSaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function FlashSaleForm({ onSuccess, onCancel }: FlashSaleFormProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    sessionAt: '',
    claimDeadline: '',
    artistId: '',
    serviceId: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: artists } = useQuery<Artist[]>({
    queryKey: ['artists-select'],
    queryFn: async () => (await api.get<Artist[]>('/artists')).data,
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ['services-select'],
    queryFn: async () => (await api.get<Service[]>('/services')).data,
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/flash-slots', {
        title: form.title,
        ...(form.description ? { description: form.description } : {}),
        originalPrice: Number(form.originalPrice),
        discountPrice: Number(form.discountPrice),
        sessionAt: new Date(form.sessionAt).toISOString(),
        claimDeadline: new Date(form.claimDeadline).toISOString(),
        artistId: form.artistId,
        serviceId: form.serviceId,
      }),
    onSuccess,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setError(typeof msg === 'string' ? msg : 'Erro ao criar flash sale');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      !form.title ||
      !form.originalPrice ||
      !form.discountPrice ||
      !form.sessionAt ||
      !form.claimDeadline ||
      !form.artistId ||
      !form.serviceId
    ) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (Number(form.discountPrice) >= Number(form.originalPrice)) {
      setError('O preço com desconto deve ser menor que o preço original.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <h3 className="font-semibold text-slate-900 mb-4">Novo Flash Sale</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Slot relâmpago — blackwork 2h"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preço original (R$) *
            </label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preço com desconto (R$) *
            </label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data/hora da sessão *
            </label>
            <input
              type="datetime-local"
              value={form.sessionAt}
              onChange={(e) => setForm({ ...form, sessionAt: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prazo para reservar *
            </label>
            <input
              type="datetime-local"
              value={form.claimDeadline}
              onChange={(e) => setForm({ ...form, claimDeadline: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Artista *</label>
            <select
              value={form.artistId}
              onChange={(e) => setForm({ ...form, artistId: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">Selecione</option>
              {artists?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serviço *</label>
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">Selecione</option>
              {services?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {mutation.isPending ? 'Publicando...' : 'Publicar Flash Sale'}
          </button>
        </div>
      </form>
    </div>
  );
}
