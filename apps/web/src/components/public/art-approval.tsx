'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle2, XCircle, AlertCircle, RefreshCw, ImageIcon, ThumbsUp, MessageSquare,
} from 'lucide-react';

const PUBLIC_API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3333';

interface ArtFile {
  id: string;
  version: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REVISION_REQUESTED';
  notes?: string | undefined;
  clientNotes?: string | undefined;
  project?: { name: string } | undefined;
}

interface ArtApprovalData {
  artFile: ArtFile;
  viewUrl: string;
}

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${PUBLIC_API}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

async function postPublic<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  };
  const res = await fetch(`${PUBLIC_API}${path}`, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function ArtApprovalPage({ token }: { token: string }) {
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [result, setResult] = useState<'approved' | 'revision' | null>(null);

  const { data, isLoading, isError, error } = useQuery<ArtApprovalData>({
    queryKey: ['art-approval', token],
    queryFn: () => fetchPublic<ArtApprovalData>(`/public/art/${token}`),
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: () => postPublic(`/public/art/${token}/approve`),
    onSuccess: () => setResult('approved'),
  });

  const revisionMutation = useMutation({
    mutationFn: () =>
      postPublic(`/public/art/${token}/request-revision`, { clientNotes: revisionNotes }),
    onSuccess: () => setResult('revision'),
  });

  // Already decided
  if (result === 'approved') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Arte aprovada!</h1>
          <p className="text-slate-500 text-sm">Seu artista foi notificado. Aguarde o contato para agendar a próxima sessão.</p>
        </div>
      </Layout>
    );
  }

  if (result === 'revision') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={32} className="text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Revisão solicitada!</h1>
          <p className="text-slate-500 text-sm">Seu artista receberá suas observações e entrará em contato.</p>
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

  if (isError || !data) {
    const errorMessage = (error as Error)?.message ?? '';
    const isExpired = errorMessage.includes('expired') || errorMessage.includes('Invalid');
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {isExpired ? 'Link expirado' : 'Link inválido'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isExpired
              ? 'Este link de aprovação expirou. Solicite ao seu artista um novo link.'
              : 'Este link não é válido. Verifique o link enviado pelo WhatsApp.'}
          </p>
        </div>
      </Layout>
    );
  }

  const { artFile, viewUrl } = data;
  const isAlreadyDecided = artFile.status === 'APPROVED' || artFile.status === 'REVISION_REQUESTED';

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-3">
            <ImageIcon size={24} className="text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Aprovação de Arte</h1>
          {artFile.project?.name && (
            <p className="text-slate-500 text-sm mt-1">Projeto: {artFile.project.name}</p>
          )}
          <p className="text-slate-400 text-xs mt-1">Versão {artFile.version}</p>
        </div>

        {/* Art preview */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {artFile.mimeType.startsWith('image/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={viewUrl}
              alt={artFile.filename}
              className="w-full object-contain max-h-96"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon size={32} className="text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">{artFile.filename}</p>
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium underline"
              >
                Abrir arquivo
              </a>
            </div>
          )}
        </div>

        {/* Artist notes */}
        {artFile.notes && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-600 mb-1">Mensagem do artista</p>
            <p className="text-sm text-slate-700">{artFile.notes}</p>
          </div>
        )}

        {/* Already decided */}
        {isAlreadyDecided ? (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-sm text-slate-500">
              {artFile.status === 'APPROVED'
                ? '✓ Você já aprovou esta arte.'
                : '⚠ Você já solicitou revisão desta arte.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Revision form */}
            {showRevisionForm && (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Descreva as alterações desejadas..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
                {revisionMutation.isError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs">
                    <AlertCircle size={14} />
                    Erro ao enviar. Tente novamente.
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRevisionForm(false)}
                    className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => revisionMutation.mutate()}
                    disabled={!revisionNotes.trim() || revisionMutation.isPending}
                    className="flex-1 px-4 py-3 text-sm font-semibold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl transition-colors"
                  >
                    {revisionMutation.isPending ? 'Enviando...' : 'Solicitar Revisão'}
                  </button>
                </div>
              </div>
            )}

            {!showRevisionForm && (
              <>
                {approveMutation.isError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs">
                    <AlertCircle size={14} />
                    Erro ao aprovar. Tente novamente.
                  </div>
                )}
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-base transition-colors"
                >
                  <ThumbsUp size={20} />
                  {approveMutation.isPending ? 'Aprovando...' : 'Aprovar Arte'}
                </button>
                <button
                  onClick={() => setShowRevisionForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-orange-300 text-orange-600 font-semibold rounded-xl text-sm hover:bg-orange-50 transition-colors"
                >
                  <MessageSquare size={16} />
                  Solicitar Alterações
                </button>
              </>
            )}
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
