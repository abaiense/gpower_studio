'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import axios from 'axios';

interface ArtUploadProps {
  projectId: string;
  onSuccess: () => void;
}

export function ArtUpload({ projectId, onSuccess }: ArtUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState<'idle' | 'getting-url' | 'uploading' | 'confirming'>('idle');
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Nenhum arquivo selecionado');
      setProgress('getting-url');

      // Step 1: Get pre-signed URL
      const initRes = await api.post<{ artFileId: string; uploadUrl: string; s3Key: string }>(
        `/projects/${projectId}/art-files`,
        {
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          notes: notes.trim() || undefined,
        },
      );

      const { artFileId, uploadUrl } = initRes.data;

      setProgress('uploading');

      // Step 2: Upload to S3 via pre-signed URL (no auth header)
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
      });

      setProgress('confirming');

      // Step 3: Confirm upload
      await api.post(`/projects/${projectId}/art-files/${artFileId}/confirm`);

      return artFileId;
    },
    onSuccess: () => {
      setFile(null);
      setNotes('');
      setProgress('idle');
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Erro no upload. Tente novamente.');
      setProgress('idle');
    },
  });

  const progressLabel: Record<string, string> = {
    idle: '',
    'getting-url': 'Preparando upload...',
    uploading: 'Enviando arquivo...',
    confirming: 'Confirmando...',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">Upload de Arte</h3>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          {error}
        </div>
      )}

      {!file ? (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-amber-300 rounded-xl p-8 cursor-pointer hover:bg-amber-50 transition-colors">
          <Upload size={24} className="text-amber-400" />
          <span className="text-sm text-slate-600 font-medium">Clique para selecionar arquivo</span>
          <span className="text-xs text-slate-400">PNG, JPG, PDF até 20MB</span>
          <input
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => {
              setError(null);
              setFile(e.target.files?.[0] ?? null);
            }}
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={() => { setFile(null); setError(null); }}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <textarea
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas para o cliente (opcional)..."
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onSuccess}
          className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => uploadMutation.mutate()}
          disabled={!file || uploadMutation.isPending}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {progress !== 'idle' ? progressLabel[progress] : 'Fazer Upload'}
        </button>
      </div>
    </div>
  );
}
