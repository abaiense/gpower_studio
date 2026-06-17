'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, Clock, XCircle, FolderKanban,
  Plus, AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ArtGallery } from './art-gallery';
import { ArtUpload } from './art-upload';

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type ArtFileStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REVISION_REQUESTED';

interface ArtFile {
  id: string;
  version: number;
  filename: string;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
  status: ArtFileStatus;
  notes?: string;
  clientNotes?: string;
  projectId: string;
  studioId: string;
  createdAt: string;
}

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
  client?: { id: string; firstName: string; lastName: string; phone?: string };
  artist?: { id: string; firstName: string; lastName: string };
  artFiles?: ArtFile[];
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; className: string; Icon: React.ElementType }> = {
    ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-700', Icon: Clock },
    COMPLETED: { label: 'Concluído', className: 'bg-slate-100 text-slate-600', Icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-700', Icon: XCircle },
  };
  const { label, className, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();

  const { data: project, isLoading, isError } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get<Project>(`/projects/${projectId}`)).data,
  });

  const closeMutation = useMutation({
    mutationFn: async () => api.post(`/projects/${projectId}/close`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-1/3" />
        <div className="h-40 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle size={32} className="text-red-400 mb-3" />
        <p className="text-slate-600 font-medium">Projeto não encontrado</p>
        <Link href="/projetos" className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium">
          ← Voltar para Projetos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/projetos" className="text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-slate-500 text-sm mt-1">{project.description}</p>
            )}
          </div>
        </div>
        {project.status === 'ACTIVE' && (
          <button
            onClick={() => closeMutation.mutate()}
            disabled={closeMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <CheckCircle2 size={16} />
            {closeMutation.isPending ? 'Fechando...' : 'Fechar Projeto'}
          </button>
        )}
      </div>

      {closeMutation.isError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} />
          Não foi possível fechar o projeto. Verifique se todos os agendamentos estão concluídos.
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Cliente</p>
          {project.client ? (
            <Link
              href={`/clientes/${project.client.id}`}
              className="text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors"
            >
              {project.client.firstName} {project.client.lastName}
            </Link>
          ) : (
            <p className="text-sm text-slate-400">—</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Artista</p>
          <p className="text-sm font-semibold text-slate-900">
            {project.artist ? `${project.artist.firstName} ${project.artist.lastName}` : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Sessões Estimadas</p>
          <p className="text-sm font-semibold text-slate-900">
            {project.estimatedSessions ?? '—'}
          </p>
        </div>
      </div>

      {/* Art Gallery */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FolderKanban size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">Arquivos de Arte</h2>
            <span className="text-xs text-slate-400">({project.artFiles?.length ?? 0} versões)</span>
          </div>
          {project.status === 'ACTIVE' && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Plus size={16} />
              Upload de Arte
            </button>
          )}
        </div>

        {showUpload && (
          <div className="px-5 py-4 border-b border-slate-100 bg-amber-50">
            <ArtUpload
              projectId={projectId}
              onSuccess={() => {
                setShowUpload(false);
                queryClient.invalidateQueries({ queryKey: ['project', projectId] });
              }}
            />
          </div>
        )}

        <div className="p-5">
          <ArtGallery
            projectId={projectId}
            artFiles={project.artFiles ?? []}
            clientPhone={project.client?.phone}
          />
        </div>
      </div>
    </div>
  );
}
