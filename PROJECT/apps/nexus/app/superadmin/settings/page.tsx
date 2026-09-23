'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Lock,
  Bot,
  Sparkles,
  HardDrive,
  ShieldCheck,
  Bell,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Database,
  Globe,
  KeyRound,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { superadminApi } from '@/lib/api/superadmin';

type SettingsTab = 'platform' | 'auth' | 'ai' | 'rag' | 'storage' | 'security' | 'notifications';

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('platform');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<any>({
    platform: {
      platform_name: 'NexusRAG Multi-Domain Enterprise',
      support_email: 'support@localfix.app',
      default_storage_quota_gb: 10,
      reserved_subdomains: 'admin, superadmin, api, app, auth, nexus, system, billing',
      allow_tenant_registration: true,
      brand_color: '#6366f1',
    },
    auth: {
      jwt_access_token_expire_minutes: 1440,
      session_idle_timeout_hours: 72,
      enforce_mfa_global: false,
      max_login_attempts_lockout: 5,
      allow_sso_google: true,
      allow_sso_github: true,
      allow_sso_saml: false,
    },
    ai: {
      default_chat_model: 'gemini-1.5-pro',
      default_embedding_model: 'text-embedding-3-small',
      default_temperature: 0.2,
      max_context_tokens: 8192,
      enable_streaming: true,
    },
    rag: {
      default_chunk_size: 512,
      default_chunk_overlap: 64,
      similarity_threshold: 0.75,
      enable_hybrid_search: true,
      vector_metric: 'cosine',
    },
    storage: {
      max_upload_size_mb: 50,
      allowed_mime_types: '.pdf, .docx, .txt, .csv, .json, .md',
      auto_deduplication: true,
      retention_days: 365,
    },
    security: {
      rate_limit_requests_per_min: 120,
      allowed_cors_origins: 'http://localhost:3000, http://127.0.0.1:3000',
      ip_whitelist_superadmin: '',
    },
    notifications: {
      webhook_url: 'https://api.localfix.app/v1/webhooks/alerts',
      alert_on_tenant_creation: true,
      alert_on_failed_logins: true,
      alert_on_high_storage: true,
    },
  });

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await superadminApi.getPlatformSettings();
      if (data && typeof data === 'object') {
        setSettings(data);
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);
    try {
      await superadminApi.updatePlatformSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || 'Failed to persist platform settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType; desc: string }> = [
    { id: 'platform', label: 'Platform & Brand', icon: Building2, desc: 'Branding, subdomains & default tenant quotas' },
    { id: 'auth', label: 'Auth & Security', icon: Lock, desc: 'JWT expiration, sessions & MFA requirements' },
    { id: 'ai', label: 'AI & LLM Routing', icon: Bot, desc: 'Default foundation models & generation controls' },
    { id: 'rag', label: 'RAG & pgvector', icon: Sparkles, desc: 'Chunking strategies & vector search thresholds' },
    { id: 'storage', label: 'Storage & Files', icon: HardDrive, desc: 'MinIO uploads, limits & MIME permissions' },
    { id: 'security', label: 'Rate Limits & CORS', icon: ShieldCheck, desc: 'Traffic throttling, CORS & IP protection' },
    { id: 'notifications', label: 'Alerts & Webhooks', icon: Bell, desc: 'Event webhooks & system alert triggers' },
  ];

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
              Root Governance & Control Plane
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Platform Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure system parameters, RAG defaults, AI models, and enterprise security policies across all tenants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh Platform Settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="truncate">
                  <div className="text-xs truncate">{tab.label}</div>
                  <div className={`text-[10px] font-normal truncate ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="p-6 sm:p-7 border-slate-800 bg-slate-900/70 shadow-2xl rounded-2xl">
              {/* Tab 1: Platform */}
              {activeTab === 'platform' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Platform Branding & Tenant Defaults</h3>
                    <p className="text-xs text-slate-400">Core operational identity and onboarding policies.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Platform Name</label>
                      <input
                        type="text"
                        value={settings.platform.platform_name}
                        onChange={(e) => updateField('platform', 'platform_name', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Global Support Email</label>
                      <input
                        type="email"
                        value={settings.platform.support_email}
                        onChange={(e) => updateField('platform', 'support_email', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Default Tenant Storage Quota (GB)</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={settings.platform.default_storage_quota_gb}
                        onChange={(e) => updateField('platform', 'default_storage_quota_gb', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Brand Accent Color (Hex)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.platform.brand_color}
                          onChange={(e) => updateField('platform', 'brand_color', e.target.value)}
                          className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 p-1 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.platform.brand_color}
                          onChange={(e) => updateField('platform', 'brand_color', e.target.value)}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">Reserved Subdomains</label>
                    <textarea
                      rows={2}
                      value={settings.platform.reserved_subdomains}
                      onChange={(e) => updateField('platform', 'reserved_subdomains', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <span className="text-[10px] text-slate-500">Subdomains prevented from being claimed during tenant registration.</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.platform.allow_tenant_registration}
                        onChange={(e) => updateField('platform', 'allow_tenant_registration', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Allow Public Tenant Self-Service Registration</span>
                        <span className="text-[10px] text-slate-400">When enabled, companies can register workspaces directly from /register.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Auth */}
              {activeTab === 'auth' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Authentication & Session Security</h3>
                    <p className="text-xs text-slate-400">Token validity, session lifetimes, and enterprise identity providers.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Access Token TTL (Minutes)</label>
                      <input
                        type="number"
                        min="15"
                        max="43200"
                        value={settings.auth.jwt_access_token_expire_minutes}
                        onChange={(e) => updateField('auth', 'jwt_access_token_expire_minutes', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500">1440 min = 24 hours.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Session Idle Timeout (Hours)</label>
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={settings.auth.session_idle_timeout_hours}
                        onChange={(e) => updateField('auth', 'session_idle_timeout_hours', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">Max Failed Login Attempts Before Lockout</label>
                    <input
                      type="number"
                      min="3"
                      max="20"
                      value={settings.auth.max_login_attempts_lockout}
                      onChange={(e) => updateField('auth', 'max_login_attempts_lockout', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 max-w-xs"
                    />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.auth.enforce_mfa_global}
                        onChange={(e) => updateField('auth', 'enforce_mfa_global', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Enforce MFA Globally for Platform SuperAdmins</span>
                        <span className="text-[10px] text-slate-400">Requires TOTP two-factor authentication on root login.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.auth.allow_sso_google}
                        onChange={(e) => updateField('auth', 'allow_sso_google', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Enable Google OAuth2 SSO</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.auth.allow_sso_github}
                        onChange={(e) => updateField('auth', 'allow_sso_github', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Enable GitHub OAuth2 SSO</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 3: AI Models */}
              {activeTab === 'ai' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">AI Models & LLM Routing</h3>
                    <p className="text-xs text-slate-400">Configure default foundation models for reasoning and embeddings.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Default Generative Chat Model</label>
                      <select
                        value={settings.ai.default_chat_model}
                        onChange={(e) => updateField('ai', 'default_chat_model', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Fast & 1M Context)</option>
                        <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra-Low Latency)</option>
                        <option value="gpt-4o">OpenAI GPT-4o (Multimodal)</option>
                        <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                        <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                        <option value="llama-3.1-70b">Meta Llama 3.1 70B (Local/VLLM)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Default Vector Embedding Model</label>
                      <select
                        value={settings.ai.default_embedding_model}
                        onChange={(e) => updateField('ai', 'default_embedding_model', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="text-embedding-3-small">OpenAI text-embedding-3-small (1536 dim)</option>
                        <option value="text-embedding-3-large">OpenAI text-embedding-3-large (3072 dim)</option>
                        <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (Local HuggingFace 384 dim)</option>
                        <option value="bge-large-en-v1.5">BAAI bge-large-en-v1.5 (1024 dim)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Default Temperature ({settings.ai.default_temperature})</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.ai.default_temperature}
                        onChange={(e) => updateField('ai', 'default_temperature', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500">Lower = more deterministic factual citations.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Max Context Tokens</label>
                      <input
                        type="number"
                        min="1024"
                        max="32768"
                        step="1024"
                        value={settings.ai.max_context_tokens}
                        onChange={(e) => updateField('ai', 'max_context_tokens', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.ai.enable_streaming}
                        onChange={(e) => updateField('ai', 'enable_streaming', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Enable Server-Sent Event (SSE) Streaming</span>
                        <span className="text-[10px] text-slate-400">Streams token responses in real time to the chat UI.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 4: RAG Engine */}
              {activeTab === 'rag' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">RAG & pgvector Index Defaults</h3>
                    <p className="text-xs text-slate-400">Chunking policies, hybrid search algorithms, and relevance thresholds.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Default Chunk Size (Tokens)</label>
                      <input
                        type="number"
                        min="128"
                        max="2048"
                        value={settings.rag.default_chunk_size}
                        onChange={(e) => updateField('rag', 'default_chunk_size', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Chunk Overlap (Tokens)</label>
                      <input
                        type="number"
                        min="0"
                        max="256"
                        value={settings.rag.default_chunk_overlap}
                        onChange={(e) => updateField('rag', 'default_chunk_overlap', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Cosine Similarity Threshold ({settings.rag.similarity_threshold})</label>
                      <input
                        type="range"
                        min="0.4"
                        max="0.95"
                        step="0.05"
                        value={settings.rag.similarity_threshold}
                        onChange={(e) => updateField('rag', 'similarity_threshold', Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500">Only chunks with score &ge; threshold are fed into context.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">pgvector Distance Metric</label>
                      <select
                        value={settings.rag.vector_metric}
                        onChange={(e) => updateField('rag', 'vector_metric', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="cosine">Cosine Distance (&lt;=&gt;)</option>
                        <option value="l2">Euclidean / L2 Distance (&lt;-&gt;)</option>
                        <option value="inner_product">Inner Product (&lt;#&gt;)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.rag.enable_hybrid_search}
                        onChange={(e) => updateField('rag', 'enable_hybrid_search', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Enable Reciprocal Rank Fusion (Hybrid BM25 + Vector)</span>
                        <span className="text-[10px] text-slate-400">Combines full-text keyword matching with dense semantic embeddings.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 5: Storage */}
              {activeTab === 'storage' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">MinIO & Storage Policies</h3>
                    <p className="text-xs text-slate-400">Upload boundaries, document type allowlists, and deduplication.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Max File Upload Size (MB)</label>
                      <input
                        type="number"
                        min="5"
                        max="500"
                        value={settings.storage.max_upload_size_mb}
                        onChange={(e) => updateField('storage', 'max_upload_size_mb', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Document Retention (Days)</label>
                      <input
                        type="number"
                        min="30"
                        max="3650"
                        value={settings.storage.retention_days}
                        onChange={(e) => updateField('storage', 'retention_days', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">Allowed MIME / Extensions</label>
                    <input
                      type="text"
                      value={settings.storage.allowed_mime_types}
                      onChange={(e) => updateField('storage', 'allowed_mime_types', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.storage.auto_deduplication}
                        onChange={(e) => updateField('storage', 'auto_deduplication', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Automatic SHA-256 Checksum Deduplication</span>
                        <span className="text-[10px] text-slate-400">Prevents identical files from consuming extra storage and re-indexing.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 6: Security */}
              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Rate Limiting & Network Access</h3>
                    <p className="text-xs text-slate-400">Protect API throughput and define permitted CORS origins.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">Global API Rate Limit (Req / Min / IP)</label>
                      <input
                        type="number"
                        min="30"
                        max="1000"
                        value={settings.security.rate_limit_requests_per_min}
                        onChange={(e) => updateField('security', 'rate_limit_requests_per_min', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 font-mono">SuperAdmin IP Whitelist (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 192.168.1.0/24 (Leave blank for unrestricted)"
                        value={settings.security.ip_whitelist_superadmin}
                        onChange={(e) => updateField('security', 'ip_whitelist_superadmin', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">Allowed CORS Origins</label>
                    <input
                      type="text"
                      value={settings.security.allowed_cors_origins}
                      onChange={(e) => updateField('security', 'allowed_cors_origins', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 7: Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Webhooks & Alert Subscriptions</h3>
                    <p className="text-xs text-slate-400">Broadcast security incidents and tenant milestones.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">System Webhook URL</label>
                    <input
                      type="url"
                      value={settings.notifications.webhook_url}
                      onChange={(e) => updateField('notifications', 'webhook_url', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.notifications.alert_on_tenant_creation}
                        onChange={(e) => updateField('notifications', 'alert_on_tenant_creation', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Trigger Webhook on New Tenant Organization Registered</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.notifications.alert_on_failed_logins}
                        onChange={(e) => updateField('notifications', 'alert_on_failed_logins', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Trigger Alert on Repeated Failed Root Logins</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.notifications.alert_on_high_storage}
                        onChange={(e) => updateField('notifications', 'alert_on_high_storage', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Trigger Alert when Tenant Exceeds 85% Storage Quota</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {savedSuccess && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> Platform settings saved and applied!
                    </span>
                  )}
                  {errorMessage && (
                    <span className="text-xs text-rose-400 flex items-center gap-1.5 font-bold animate-in fade-in">
                      <AlertCircle className="w-4 h-4" /> {errorMessage}
                    </span>
                  )}
                  {!savedSuccess && !errorMessage && (
                    <span className="text-[11px] font-mono text-slate-500">
                      Settings are recorded in the immutable platform audit log.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Persisting...' : 'Save Settings'}</span>
                </button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
