'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTenantStore } from '@/stores/tenant-store';
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Save,
  Mail,
  Server,
  Key,
  Lock,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import { apiClient } from '@/lib/api';

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  has_password?: boolean;
  use_tls: boolean;
  use_ssl: boolean;
  from_email: string;
  from_name: string;
  is_enabled: boolean;
  configured?: boolean;
}

const SMTP_PRESETS = [
  {
    name: 'Gmail / Google Workspace',
    icon: '🔴',
    host: 'smtp.gmail.com',
    port: 587,
    use_tls: true,
    use_ssl: false,
    tip: 'Use a 16-character Google App Password (not your personal account password).',
  },
  {
    name: 'Microsoft 365 / Outlook',
    icon: '🔵',
    host: 'smtp.office365.com',
    port: 587,
    use_tls: true,
    use_ssl: false,
    tip: 'Requires Authenticated SMTP enabled in Exchange admin portal.',
  },
  {
    name: 'Amazon SES',
    icon: '🟠',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    use_tls: true,
    use_ssl: false,
    tip: 'Use SES SMTP credentials generated in AWS IAM console.',
  },
  {
    name: 'SendGrid',
    icon: '🔷',
    host: 'smtp.sendgrid.net',
    port: 587,
    use_tls: true,
    use_ssl: false,
    tip: 'Set Username to "apikey" and Password to your SendGrid API key.',
  },
  {
    name: 'Mailgun',
    icon: '🔴',
    host: 'smtp.mailgun.org',
    port: 587,
    use_tls: true,
    use_ssl: false,
    tip: 'Use your domain SMTP credentials from Mailgun sending dashboard.',
  },
];

export default function TenantSettingsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const { tenant } = useTenantStore();

  const [activeTab, setActiveTab] = useState<'smtp' | 'general' | 'security'>('smtp');
  const [showPassword, setShowPassword] = useState(false);

  // SMTP Form State
  const [smtp, setSmtp] = useState<SMTPConfig>({
    host: '',
    port: 587,
    username: '',
    password: '',
    has_password: false,
    use_tls: true,
    use_ssl: false,
    from_email: '',
    from_name: '',
    is_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Test Email State
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch current SMTP configuration from live database API
  useEffect(() => {
    const fetchSmtpConfig = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/settings/smtp');
        if (res.data) {
          const data = res.data;
          setSmtp({
            host: data.host || '',
            port: data.port || 587,
            username: data.username || '',
            password: data.password || '',
            has_password: data.has_password || false,
            use_tls: data.use_tls ?? true,
            use_ssl: data.use_ssl ?? false,
            from_email: data.from_email || '',
            from_name: data.from_name || '',
            is_enabled: data.is_enabled ?? true,
            configured: data.configured ?? false,
          });
        }
      } catch (err) {
        console.error('Failed to load SMTP settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSmtpConfig();
  }, [tenantSlug]);

  const handleApplyPreset = (preset: typeof SMTP_PRESETS[0]) => {
    setSmtp(prev => ({
      ...prev,
      host: preset.host,
      port: preset.port,
      use_tls: preset.use_tls,
      use_ssl: preset.use_ssl,
    }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await apiClient.put('/settings/smtp', smtp);
      setSaveSuccess(true);
      setSmtp(prev => ({ ...prev, has_password: Boolean(prev.password) || prev.has_password }));
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setTestResult({ success: false, message: 'Please enter a valid recipient email address' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await apiClient.post('/settings/smtp/test', {
        recipient_email: testEmail,
        host: smtp.host,
        port: smtp.port,
        username: smtp.username,
        password: smtp.password,
        use_tls: smtp.use_tls,
        use_ssl: smtp.use_ssl,
        from_email: smtp.from_email,
        from_name: smtp.from_name,
      });

      setTestResult({
        success: true,
        message: res.data?.message || `Test email successfully delivered to ${testEmail}!`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.detail || err.message || 'SMTP test delivery failed',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Tenant Workspace Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {tenantSlug}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure organization mail server, identity branding, and enterprise security policies
          </p>
        </div>

        <Link
          href={`/${tenantSlug}/settings/notifications`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition shadow-sm self-start sm:self-auto"
        >
          <Bell className="w-3.5 h-3.5 text-indigo-400" />
          <span>Notification Preferences</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'smtp'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>SMTP & Mailing System</span>
          {smtp.is_enabled && smtp.host && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Organization Identity</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security & Policies</span>
        </button>
      </div>

      {/* TAB 1: SMTP & MAILING SYSTEM */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick SMTP Provider Presets</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {SMTP_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    smtp.host === preset.host
                      ? 'bg-indigo-950/50 border-indigo-500/60 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="text-sm mb-1">{preset.icon}</div>
                  <div className="text-xs font-semibold text-slate-200 truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{preset.host}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveSmtp} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span>Outgoing Mail Server (SMTP)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Used for member invitations, approval notifications, and automated RAG event alerts.
                </p>
              </div>

              {/* Enabled Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={smtp.is_enabled}
                  onChange={(e) => setSmtp({ ...smtp, is_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-300">
                  {smtp.is_enabled ? '🟢 Custom SMTP Enabled' : '⚪ Disabled'}
                </span>
              </label>
            </div>

            {loading ? (
              <div className="py-12 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-xs">Loading SMTP settings...</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Host and Port */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1.5">
                      SMTP Host <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. smtp.gmail.com or mail.yourcompany.com"
                      value={smtp.host}
                      onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Port <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={65535}
                      value={smtp.port}
                      onChange={(e) => setSmtp({ ...smtp, port: parseInt(e.target.value) || 587 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Username and Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Authentication Username / Email
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. team@yourcompany.com or apikey"
                      value={smtp.username}
                      onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Authentication Password / App Token
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={smtp.has_password ? '•••••••• (Saved)' : 'Enter SMTP password'}
                        value={smtp.password}
                        onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sender Display Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Sender Name (From Name) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Matrix Team"
                      value={smtp.from_name}
                      onChange={(e) => setSmtp({ ...smtp, from_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Sender Email (From Address) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. noreply@yourcompany.com"
                      value={smtp.from_email}
                      onChange={(e) => setSmtp({ ...smtp, from_email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                {/* Encryption Settings */}
                <div className="pt-2">
                  <label className="block text-slate-300 font-medium mb-2">Encryption & Security Protocol</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      smtp.use_tls && !smtp.use_ssl
                        ? 'bg-indigo-950/40 border-indigo-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="encryption"
                        checked={smtp.use_tls && !smtp.use_ssl}
                        onChange={() => setSmtp({ ...smtp, use_tls: true, use_ssl: false })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-semibold text-xs text-slate-200">STARTTLS (Recommended)</div>
                        <div className="text-[10px] text-slate-500">Standard for Port 587</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      smtp.use_ssl
                        ? 'bg-indigo-950/40 border-indigo-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="encryption"
                        checked={smtp.use_ssl}
                        onChange={() => setSmtp({ ...smtp, use_ssl: true, use_tls: false })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-semibold text-xs text-slate-200">SSL / TLS Direct</div>
                        <div className="text-[10px] text-slate-500">Standard for Port 465</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      !smtp.use_tls && !smtp.use_ssl
                        ? 'bg-indigo-950/40 border-indigo-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="encryption"
                        checked={!smtp.use_tls && !smtp.use_ssl}
                        onChange={() => setSmtp({ ...smtp, use_tls: false, use_ssl: false })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-semibold text-xs text-slate-200">None (Plaintext)</div>
                        <div className="text-[10px] text-slate-500">Local development only</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SMTP configuration successfully saved and updated in PostgreSQL.</span>
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>

          {/* Test Email Section */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live SMTP Delivery Test</h3>
            </div>
            <p className="text-xs text-slate-400">
              Send a real HTML verification email to test server handshake, authentication, and delivery.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter recipient email (e.g. your-email@gmail.com)"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={testing || !smtp.host}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{testing ? 'Verifying & Sending...' : 'Send Test Email'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`flex items-start gap-2 p-3.5 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {testResult.success ? 'Test Delivery Succeeded' : 'Test Delivery Failed'}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">{testResult.message}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL IDENTITY */}
      {activeTab === 'general' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-4">Organization Identity</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Company Name</label>
              <input
                type="text"
                defaultValue={tenant?.name || 'Organization'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Assigned Subdomain</label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <input
                  type="text"
                  readOnly
                  defaultValue={tenant?.subdomain || tenantSlug}
                  className="w-full px-3.5 py-2.5 bg-transparent text-slate-400 font-mono focus:outline-none"
                />
                <span className="px-3.5 py-2.5 text-slate-500 bg-slate-900 border-l border-slate-800 font-mono">
                  .localhost:3000
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Custom Domain White-Labeling (CNAME)</label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="rag.company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & ACCESS */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Access & Security Policies</h3>
          
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Enforce Multi-Factor Authentication (MFA)</div>
                <div className="text-slate-500 text-[11px]">Require all organization members to configure TOTP MFA upon login</div>
              </div>
              <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700" />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Password Authentication</div>
                <div className="text-slate-500 text-[11px]">Allow standard email and password authentication</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
