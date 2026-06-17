'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Client { id: string; firstName: string; lastName: string; }
interface User { id: string; firstName: string; lastName: string; role: string; }

interface CreateProjectPayload {
  name: string;
  description?: string;
  clientId: string;
  artistId: string;
  estimatedSessions?: number;
}

interface FormState {
  name: string;
  description: string;
  clientId: string;
  artistId: string;
  estimatedSessions: number | '';
}

export function ProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    clientId: '',
    artistId: '',
    estimatedSessions: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['clients-select'],
    queryFn: async () => (await api.get<Client[]>('/clients')).data,
  });

  const { data: artists } = useQuery<User[]>({
    queryKey: ['artists-select'],
    queryFn: async () => {
      const res = await api.get<User[]>('/users', { params: { role: 'ARTIST' } });
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateProjectPayload) => {
      const res = await api.post('/projects', data);
      return res.data;
    },
    onSuccess: (project: { id: string }) => {
      router.push(`/projetos/${project.id}`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Erro ao criar projeto');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.clientId || !form.artistId) {
      setError('Nome, cliente e artista são obrigatórios.');
      return;
    }
    const payload: CreateProjectPayload = {
      name: form.name.trim(),
      clientId: form.clientId,
      artistId: form.artistId,
    };
    const desc = form.description.trim();
    if (desc) payload.description = desc;
    if (form.estimatedSessions !== '') payload.estimatedSessions = Number(form.estimatedSessions);
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projetos" className="text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Projeto</h1>
          <p className="text-slate-500 text-sm mt-0.5">Crie um projeto para gerenciar sessões multi-etapa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nome do projeto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Manga completa, Dragão nas costas..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detalhes do projeto, estilo, referências..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              <option value="">Selecione um cliente</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Artista <span className="text-red-500">*</span>
            </label>
            <select
              value={form.artistId}
              onChange={(e) => setForm({ ...form, artistId: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              <option value="">Selecione um artista</option>
              {artists?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Sessões estimadas
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={form.estimatedSessions ?? ''}
            onChange={(e) => setForm({ ...form, estimatedSessions: e.target.value ? Number(e.target.value) : '' })}
            placeholder="Ex: 4"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/projetos"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {mutation.isPending ? 'Criando...' : 'Criar Projeto'}
          </button>
        </div>
      </form>
    </div>
  );
}
