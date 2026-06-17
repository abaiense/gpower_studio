'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FolderOpen, Plus, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  estimatedSessions?: number;
  clientId: string;
  artistId: string;
  studioId: string;
  createdAt: string;
  client?: { firstName: string; lastName: string };
  artist?: { firstName: string; lastName: string };
  artFiles?: Array<{ id: string; status: string }>;
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; className: string; Icon: React.ElementType }> = {
    ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-700', Icon: Clock },
    COMPLETED: { label: 'Concluído', className: 'bg-slate-100 text-slate-600', Icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-700', Icon: XCircle },
  };
  const { label, className, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="h-5 bg-slate-100 rounded w-1/2 mb-3" />
      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-1/4" />
    </div>
  );
}

export function ProjectsList() {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ['projects', statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get<Project[]>('/projects', { params });
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projetos</h1>
          <p className="text-slate-500 mt-1 text-sm">Gerencie projetos multi-sessão dos seus clientes</p>
        </div>
        <Link
          href="/projetos/novo"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          Novo Projeto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === '' ? 'Todos' : s === 'ACTIVE' ? 'Ativos' : s === 'COMPLETED' ? 'Concluídos' : 'Cancelados'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={32} className="text-red-400 mb-3" />
          <p className="text-slate-600 font-medium">Erro ao carregar projetos</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const artFile = p.artFiles?.[p.artFiles.length - 1];
            return (
              <Link
                key={p.id}
                href={`/projetos/${p.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <StatusBadge status={p.status} />
                </div>
                {p.client && (
                  <p className="text-sm text-slate-500 mb-1">
                    Cliente: {p.client.firstName} {p.client.lastName}
                  </p>
                )}
                {p.artist && (
                  <p className="text-sm text-slate-500 mb-3">
                    Artista: {p.artist.firstName} {p.artist.lastName}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <FolderOpen size={12} />
                    {p.artFiles?.length ?? 0} arquivo(s) de arte
                  </div>
                  {artFile && (
                    <span className={`text-xs font-medium ${
                      artFile.status === 'APPROVED' ? 'text-green-600' :
                      artFile.status === 'REVISION_REQUESTED' ? 'text-orange-500' :
                      artFile.status === 'SENT' ? 'text-blue-500' : 'text-slate-400'
                    }`}>
                      {artFile.status === 'APPROVED' ? '✓ Aprovado' :
                       artFile.status === 'REVISION_REQUESTED' ? '⚠ Revisão' :
                       artFile.status === 'SENT' ? '→ Enviado' : 'Rascunho'}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200">
          <FolderOpen size={40} className="text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">Nenhum projeto encontrado</p>
          <p className="text-slate-400 text-sm mt-1">Crie um projeto para começar a gerenciar sessões multi-etapa.</p>
          <Link
            href="/projetos/novo"
            className="inline-flex items-center gap-2 mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            Criar primeiro projeto
          </Link>
        </div>
      )}
    </div>
  );
}
