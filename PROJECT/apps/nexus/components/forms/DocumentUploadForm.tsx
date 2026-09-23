'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles, Layers } from 'lucide-react';
import { FormProvider } from './FormProvider';
import { FormField } from './FormField';
import { FormInput, FormSelect } from './FormControls';
import { FormSubmitButton, FormCancelButton, FormActionGroup } from './FormActions';
import { apiClient } from '@/lib/api/client';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export interface DocumentUploadFormProps {
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
  defaultDomainSlug?: string;
  availableDomains?: Array<{ slug: string; name: string }>;
}

export function DocumentUploadForm({
  onSuccess,
  onCancel,
  defaultDomainSlug = 'hr',
  availableDomains = [
    { slug: 'hr', name: 'HR & People Operations' },
    { slug: 'finance', name: 'Finance & Accounts Vault' },
    { slug: 'it', name: 'IT Systems & Runbooks' },
    { slug: 'legal', name: 'Legal & Compliance' },
    { slug: 'operations', name: 'Operations & Logistics' },
  ],
}: DocumentUploadFormProps) {
  const { user } = useWorkspace();
  const isPlatformOrOrgAdmin = !!(user?.is_org_admin || user?.is_superadmin);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [domainSlug, setDomainSlug] = useState<string>(
    (!isPlatformOrOrgAdmin && user?.department?.slug) ? user.department.slug : defaultDomainSlug
  );
  const [title, setTitle] = useState<string>('');
  const [chunkSize, setChunkSize] = useState<number>(512);
  const [chunkOverlap, setChunkOverlap] = useState<number>(64);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const onSubmit = async () => {
    if (!selectedFile) {
      throw new Error('Please select a document file to upload.');
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title || selectedFile.name);
    formData.append('domain_slug', domainSlug);
    formData.append('chunk_size', String(chunkSize));
    formData.append('chunk_overlap', String(chunkOverlap));

    const res = await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        }
      },
    });

    if (onSuccess) onSuccess(res.data);
  };

  return (
    <FormProvider onSubmit={onSubmit} className="space-y-4 text-xs">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer select-none ${
          selectedFile
            ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-300'
            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.csv,.tsv,.json,.txt,.md"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-bold text-white text-xs block">{selectedFile.name}</span>
              <span className="text-[10px] font-mono text-slate-400 block">
                {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto" />
            <div>
              <span className="text-xs font-bold text-white block">
                Click or drag & drop documents here
              </span>
              <span className="text-[10px] text-slate-500 block">
                Supports PDF, DOCX, CSV, JSON, Markdown, and TXT
              </span>
            </div>
          </div>
        )}
      </div>

      <FormField label="Document Title" required>
        <FormInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Employee Benefits Handbook 2026"
          icon={FileText}
          required
        />
      </FormField>

      {/* Target Knowledge Domain Selector */}
      {isPlatformOrOrgAdmin ? (
        <FormField label="Target Knowledge Domain" required>
          <FormSelect value={domainSlug} onChange={(e) => setDomainSlug(e.target.value)}>
            {availableDomains.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({d.slug})
              </option>
            ))}
          </FormSelect>
        </FormField>
      ) : (
        <FormField label="Target Knowledge Domain" required hint="Department Scoped">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-xs text-white">
                  {user?.department?.name || 'Human Resources'}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">
                  Scoped strictly to your assigned department vault
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Active
            </span>
          </div>
        </FormField>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Chunk Size (Tokens)" hint="RAG Resolution">
          <FormSelect
            value={String(chunkSize)}
            onChange={(e) => setChunkSize(Number(e.target.value))}
          >
            <option value="256">256 Tokens (Fine-Grained)</option>
            <option value="512">512 Tokens (Standard)</option>
            <option value="1024">1024 Tokens (Broad Context)</option>
          </FormSelect>
        </FormField>

        <FormField label="Chunk Overlap" hint="Context Boundary">
          <FormSelect
            value={String(chunkOverlap)}
            onChange={(e) => setChunkOverlap(Number(e.target.value))}
          >
            <option value="32">32 Tokens</option>
            <option value="64">64 Tokens</option>
            <option value="128">128 Tokens</option>
          </FormSelect>
        </FormField>
      </div>

      <FormActionGroup>
        {onCancel && <FormCancelButton onClick={onCancel} />}
        <FormSubmitButton
          label="Store Document (Queue for Approval)"
          submittingLabel={uploadProgress > 0 ? `Uploading (${uploadProgress}%)...` : 'Storing & Staging Document...'}
          disabled={!selectedFile}
        />
      </FormActionGroup>
    </FormProvider>
  );
}
