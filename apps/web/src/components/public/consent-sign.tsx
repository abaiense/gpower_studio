'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle2, XCircle, RefreshCw, ShieldCheck, AlertCircle, FileText,
} from 'lucide-react';

const PUBLIC_API = (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001') + '/api/v1';

interface ConsentForm {
  id: string;
  formType: string;
  data: { title: string; clauses: string };
  signedAt?: string | null;
  signerIp?: string | null;
  client?: { firstName: string; lastName: string };
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
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`${PUBLIC_API}${path}`, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function ConsentSignPage({ token }: { token: string }) {
  const [accepted, setAccepted] = useState(false);
  const [result, setResult] = useState<{ hash: string } | null>(null);

  const { data: form, isLoading, isError, error } = useQuery<ConsentForm>({
    queryKey: ['consent-form', token],
    queryFn: () => fetchPublic<ConsentForm>(`/public/consent/${token}`),
    retry: false,
  });

  const signMutation = useMutation({
    mutationFn: () => postPublic<{ message: string; hash: string }>(`/public/consent/${token}/sign`),
    onSuccess: (data) => setResult(data),
  });

  // Already signed
  if (result) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Consentimento registrado!</h1>
          <p className="text-slate-500 text-sm mb-4">
            Sua assinatura digital foi registrada com sucesso. Guarde este comprovante.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left w-full max-w-sm">
            <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Hash de verificação</p>
            <p className="text-xs font-mono text-slate-700 break-all">{result.hash}</p>
          </div>
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

  if (isError || !form) {
    const errorMessage = (error as Error | null)?.message ?? '';
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
              ? 'Este link de consentimento expirou. Solicite ao estúdio um novo link.'
              : 'Este link não é válido. Verifique o link enviado pelo WhatsApp.'}
          </p>
        </div>
      </Layout>
    );
  }

  const clauses = form.data.clauses.split('||').filter((c): c is string => c.length > 0);
  const alreadySigned = !!form.signedAt;
  const signedAt = form.signedAt ?? null;

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-3">
            <FileText size={24} className="text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{form.data.title}</h1>
          {form.client && (
            <p className="text-slate-500 text-sm mt-1">
              {form.client.firstName} {form.client.lastName}
            </p>
          )}
        </div>

        {/* Already signed notice */}
        {alreadySigned && signedAt && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Este termo já foi assinado em{' '}
              {new Date(signedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
              .
            </p>
          </div>
        )}

        {/* Clauses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">Cláusulas do termo</h2>
          </div>
          <ul className="space-y-3">
            {clauses.map((clause, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{clause}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* LGPD notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          <p className="font-semibold mb-1">Informação LGPD</p>
          <p>
            Seus dados (IP, data, hora) serão registrados para fins de auditoria conforme
            LGPD Art. 46. Nenhuma biometria ou imagem de assinatura é coletada.
          </p>
        </div>

        {/* Sign form */}
        {!alreadySigned && (
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-amber-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700">
                Li e concordo com todas as cláusulas acima. Confirmo que as informações
                prestadas são verdadeiras e assumo plena responsabilidade pelo procedimento.
              </span>
            </label>

            {signMutation.isError && (
              <div className="flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle size={14} />
                Erro ao registrar. Tente novamente.
              </div>
            )}

            <button
              onClick={() => signMutation.mutate()}
              disabled={!accepted || signMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-base transition-colors"
            >
              <ShieldCheck size={20} />
              {signMutation.isPending ? 'Assinando...' : 'Assinar e Confirmar'}
            </button>

            <p className="text-center text-xs text-slate-400">
              Ao clicar em &quot;Assinar e Confirmar&quot;, sua assinatura digital será registrada com
              data, hora e IP desta conexão.
            </p>
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
