'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Artist {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  instagram?: string;
  styles: string[];
  isActive: boolean;
  studioId: string;
  createdAt: string;
}

export function ArtistsList() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', styles: '', bio: '', instagram: '' });

  const { data: artists, isLoading, isError } = useQuery<Artist[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      const res = await api.get<Artist[]>('/artists');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload: Record<string, unknown> = {
        firstName: data.firstName,
        lastName: data.lastName,
      };
      if (data.styles.trim()) {
        payload.styles = data.styles.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (data.bio.trim()) payload.bio = data.bio.trim();
      if (data.instagram.trim()) payload.instagram = data.instagram.trim();
      await api.post('/artists', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setShowForm(false);
      setForm({ firstName: '', lastName: '', styles: '', bio: '', instagram: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/artists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Artistas</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gerencie os artistas do seu estúdio
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          Novo Artista
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">Cadastrar Artista</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Nome"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              placeholder="Sobrenome"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="sm:col-span-2">
              <input
                placeholder="Estilos (separados por vírgula — ex: Blackwork, Realismo, Old School)"
                value={form.styles}
                onChange={(e) => setForm({ ...form, styles: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                placeholder="Instagram (opcional)"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <textarea
                placeholder="Bio (opcional)"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>
          {createMutation.isError && (
            <p className="text-red-600 text-xs">Erro ao cadastrar artista.</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.firstName || !form.lastName || createMutation.isPending}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-sm font-semibold"
            >
              {createMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <AlertCircle size={32} className="text-red-400 mb-3" />
            <p className="text-slate-600 font-medium">Erro ao carregar artistas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Instagram</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Estilos</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400">Carregando...</td></tr>
                ) : artists?.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400">Nenhum artista cadastrado.</td></tr>
                ) : (
                  artists?.map((artist) => (
                    <tr key={artist.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {artist.firstName} {artist.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                        {artist.instagram ? `@${artist.instagram}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                        {artist.styles?.join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          artist.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {artist.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm('Remover este artista?')) {
                              deleteMutation.mutate(artist.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
