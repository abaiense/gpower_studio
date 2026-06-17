'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Send, Download, Image as ImageIcon, CheckCircle2, Clock, AlertTriangle, FileEdit } from 'lucide-react';
import { api } from '@/lib/api';

type ArtFileStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REVISION_REQUESTED';

interface ArtFile {
  id: string;
  version: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  status: ArtFileStatus;
  notes?: string;
  clientNotes?: string;
  createdAt: string;
}

interface ArtGalleryProps {
  projectId: string;
  artFiles: ArtFile[];
  clientPhone?: string | undefined;
}

function ArtStatusBadge({ status }: { status: ArtFileStatus }) {
  const map: Record<ArtFileStatus, { label: string; className: string; Icon: React.ElementType }> = {
    DRAFT: { label: 'Rascunho', className: 'bg-slate-100 text-slate-500', Icon: FileEdit },
    SENT: { label: 'Enviado', className: 'bg-blue-100 text-blue-600', Icon: Clock },
    APPROVED: { label: 'Aprovado', className: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
    REVISION_REQUESTED: { label: 'Revisão', className: 'bg-orange-100 text-orange-600', Icon: AlertTriangle },
  };
  const { label, className, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

export function ArtGallery({ projectId, artFiles, clientPhone }: ArtGalleryProps) {
  const queryClient = useQueryClient();
  const [sendingId, setSendingId] = useState<string | null>(null);

  const downloadMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const res = await api.get<{ url: string }>(`/projects/${projectId}/art-files/${fileId}/download`);
      window.open(res.data.url, '_blank');
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await api.post(`/projects/${projectId}/art-files/${fileId}/send`, {});
      return fileId;
    },
    onSuccess: () => {
      setSendingId(null);
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: () => setSendingId(null),
  });

  if (artFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <ImageIcon size={32} className="text-slate-200 mb-3" />
        <p className="text-slate-400 text-sm">Nenhum arquivo de arte enviado ainda.</p>
        <p className="text-slate-300 text-xs mt-1">Faça upload de uma arte para compartilhar com o cliente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[...artFiles].reverse().map((file) => (
        <div
          key={file.id}
          className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <ImageIcon size={18} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-slate-900">v{file.version}</span>
              <span className="text-sm text-slate-500 truncate">{file.filename}</span>
              <ArtStatusBadge status={file.status} />
            </div>
            <p className="text-xs text-slate-400">
              {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB ·{' '}
              {new Date(file.createdAt).toLocaleDateString('pt-BR')}
            </p>
            {file.notes && (
              <p className="text-xs text-slate-500 mt-1 italic">"{file.notes}"</p>
            )}
            {file.clientNotes && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                Cliente: "{file.clientNotes}"
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => downloadMutation.mutate(file.id)}
              disabled={downloadMutation.isPending}
              title="Baixar arquivo"
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            >
              <Download size={16} />
            </button>
            {file.status === 'DRAFT' && (
              <button
                onClick={() => {
                  setSendingId(file.id);
                  sendMutation.mutate(file.id);
                }}
                disabled={sendMutation.isPending && sendingId === file.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Send size={12} />
                {sendMutation.isPending && sendingId === file.id ? 'Enviando...' : 'Enviar para cliente'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
