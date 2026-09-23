'use client';

import React, { useState, useRef } from 'react';
import { useDocuments } from '../../hooks/use-documents';
import { ProcessingPipelineTracker } from './ProcessingPipelineTracker';
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  domainId?: string;
  onSuccess?: () => void;
}

const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'txt',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'csv',
  'jpg',
  'png',
];

const ACCEPT_STRING = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',');

export function FileDropzone({ domainId, onSuccess }: FileDropzoneProps) {
  const { uploadDocument, isUploading } = useDocuments(domainId);
  const [dragOver, setDragOver] = useState(false);
  const [activeUploads, setActiveUploads] = useState<
    Array<{ id: string; filename: string; file: File }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateAndProcessFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      setError(
        `Unsupported file type: .${extension || 'unknown'}. Allowed: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, CSV, JPG, PNG`
      );
      return;
    }

    // Limit to 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError(`File size exceeds 50MB limit.`);
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (domainId) {
      formData.append('domain_id', domainId);
    }

    try {
      const response = await uploadDocument(formData);
      const docId = response?.id || (response as any)?.document_id || (response as any)?.job_id || `temp-${Date.now()}`;
      setActiveUploads((prev) => [
        { id: docId, filename: file.name, file },
        ...prev,
      ]);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload document';
      setError(msg);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await validateAndProcessFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      await validateAndProcessFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          dragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
          <UploadCloud className={`w-8 h-8 ${isUploading ? 'animate-bounce' : ''}`} />
        </div>

        <h3 className="text-base font-semibold text-white mb-1">
          {isUploading ? 'Uploading file...' : 'Drop knowledge assets here or browse'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
          Enterprise documents are parsed, chunked, vector-embedded, and isolated strictly to this domain.
        </p>

        {/* Formats Grid */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto">
          {ALLOWED_EXTENSIONS.map((ext) => (
            <span
              key={ext}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-slate-800 text-slate-300 border border-slate-700"
            >
              .{ext}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Uploads Pipelines */}
      {activeUploads.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Ingestion Tasks
          </h4>
          <div className="space-y-3">
            {activeUploads.map((task) => (
              <ProcessingPipelineTracker
                key={task.id}
                documentId={task.id}
                filename={task.filename}
                onRetry={() => validateAndProcessFile(task.file)}
                onClose={() =>
                  setActiveUploads((prev) => prev.filter((p) => p.id !== task.id))
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
