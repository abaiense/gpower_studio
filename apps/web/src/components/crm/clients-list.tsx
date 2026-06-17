'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  birthDate?: string;
  notes?: string;
  allergies?: string;
  isBlocked: boolean;
  blockReason?: string;
  noShowCount: number;
  studioId: string;
  createdAt: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function ClientsList() {
  const [search, setSearch] = useState('');
  const [blockedFilter, setBlockedFilter] = useState<boolean | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 300);

  const fetchClients = useCallback(async (): Promise<Client[]> => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (blockedFilter !== undefined) params.isBlocked = String(blockedFilter);
    const res = await api.get<Client[]>('/clients', { params });
    return res.data;
  }, [debouncedSearch, blockedFilter]);

  const { data: clients, isLoading, isError } = useQuery<Client[]>({
    queryKey: ['clients', debouncedSearch, blockedFilter],
    queryFn: fetchClients,
  });

  const totalClients = clients?.length ?? 0;
  const blockedCount = clients?.filter((c) => c.isBlocked).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gerencie os clientes do seu estúdio
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <UserPlus size={16} />
          Novo Cliente
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total de Clientes</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {isLoading ? '—' : totalClients}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Bloqueados</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {isLoading ? '—' : blockedCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-2 sm:col-span-1">
          <p className="text-sm text-slate-500">Ativos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {isLoading ? '—' : totalClients - blockedCount}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setBlockedFilter(undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              blockedFilter === undefined
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setBlockedFilter(blockedFilter === false ? undefined : false)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              blockedFilter === false
                ? 'bg-green-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setBlockedFilter(blockedFilter === true ? undefined : true)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              blockedFilter === true
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bloqueados
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <AlertCircle size={32} className="text-red-400 mb-3" />
            <p className="text-slate-600 font-medium">Erro ao carregar clientes</p>
            <p className="text-slate-400 text-sm mt-1">
              Verifique sua conexão e tente novamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    No-shows
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : clients && clients.length > 0 ? (
                  clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/clientes/${client.id}`}
                          className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {client.firstName} {client.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{client.phone}</td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                        {client.email ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-medium ${
                            client.noShowCount > 0 ? 'text-orange-600' : 'text-slate-400'
                          }`}
                        >
                          {client.noShowCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {client.isBlocked ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Ativo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <p className="text-slate-500 font-medium">
                        {debouncedSearch || blockedFilter !== undefined
                          ? 'Nenhum cliente encontrado com os filtros aplicados.'
                          : 'Nenhum cliente cadastrado ainda.'}
                      </p>
                      {!debouncedSearch && blockedFilter === undefined && (
                        <Link
                          href="/clientes/novo"
                          className="inline-flex items-center gap-2 mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium"
                        >
                          <UserPlus size={16} />
                          Cadastrar primeiro cliente
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
