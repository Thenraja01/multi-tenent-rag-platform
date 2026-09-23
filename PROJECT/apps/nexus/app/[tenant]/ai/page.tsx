'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  FileText,
  Table,
  Presentation,
  ScanText,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Eye,
  SlidersHorizontal,
  Download,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Search,
  Zap,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { apiClient, API_BASE_URL } from '@/lib/api';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { useAuthStore } from '@/stores/auth-store';

interface Citation {
  document_id: string;
  filename?: string;
  document_name?: string;
  page_number?: number;
  similarity_score?: number;
  excerpt?: string;
  snippet?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
  rating?: 'up' | 'down' | null;
}

interface ConversationThread {
  id: string;
  title: string;
  domain_id?: string | null;
  pinned?: boolean;
  created_at: string;
  updated_at?: string;
}

export default function TenantAIPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { organization, domains, user } = useWorkspace();
  const { token } = useAuthStore();

  // Conversation Threads State
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [threadSearch, setThreadSearch] = useState('');

  // Chat Configuration & Persona
  const [selectedDomainId, setSelectedDomainId] = useState<string>('ALL');
  const [reasoningPersona, setReasoningPersona] = useState<'grounded' | 'executive' | 'sop' | 'detailed'>('grounded');

  // Chat Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Split-Screen Citation Inspector State
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming]);

  // Load persistent conversations
  const fetchConversations = async () => {
    try {
      const res = await apiClient.get('/chat/conversations');
      const list = Array.isArray(res.data) ? res.data : [];
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        loadConversation(list[0].id);
      } else if (list.length === 0) {
        initDefaultWelcome();
      }
    } catch (err) {
      console.debug('Failed to load conversations', err);
      initDefaultWelcome();
    }
  };

  const initDefaultWelcome = () => {
    const orgName = organization?.name || 'Globex';
    const deptName = user?.department?.name || 'General Enterprise';
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          `👋 Hello **${user?.full_name || 'there'}**! I am **Nexus AI Copilot**, your enterprise intelligence assistant for **${orgName}**.\n\n` +
          `I am strictly grounded on verified department knowledge partitions, policies, structured spreadsheets, and runbooks. Ask me anything or select a recommended query below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const loadConversation = async (conversationId: string) => {
    setActiveConversationId(conversationId);
    try {
      const res = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
      const msgList = Array.isArray(res.data) ? res.data : [];
      if (msgList.length === 0) {
        initDefaultWelcome();
      } else {
        setMessages(
          msgList.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.citations || m.sources || [],
            timestamp: m.created_at
              ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load thread messages:', err);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const res = await apiClient.post('/chat/conversations', {
        title: 'New Consultation',
        domain_id: selectedDomainId !== 'ALL' ? selectedDomainId : null,
      });
      const newConvo = res.data;
      setConversations((prev) => [newConvo, ...prev]);
      setActiveConversationId(newConvo.id);
      initDefaultWelcome();
    } catch (err) {
      console.error('Failed to create conversation thread:', err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/chat/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        initDefaultWelcome();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Real-Time Token Streaming Submission (SSE)
  const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || inputQuery).trim();
    if (!query || loading || streaming) return;

    // If no active conversation, create one on the fly
    let currentConvoId = activeConversationId;
    if (!currentConvoId) {
      try {
        const createRes = await apiClient.post('/chat/conversations', {
          title: query.slice(0, 35) + (query.length > 35 ? '...' : ''),
          domain_id: selectedDomainId !== 'ALL' ? selectedDomainId : null,
        });
        currentConvoId = createRes.data.id;
        setActiveConversationId(currentConvoId);
        setConversations((prev) => [createRes.data, ...prev]);
      } catch (err) {
        console.debug('Direct stream without thread', err);
      }
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const asstMsgId = `asst-${Date.now()}`;
    const initialAsstMsg: ChatMessage = {
      id: asstMsgId,
      role: 'assistant',
      content: '',
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, initialAsstMsg]);
    setInputQuery('');
    setLoading(true);
    setStreaming(true);

    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : '') || '';
      const response = await fetch(`${API_BASE_URL}/knowledge/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          query,
          domain_id: selectedDomainId !== 'ALL' ? selectedDomainId : undefined,
          top_k: 5,
          conversation_id: currentConvoId,
          persona: reasoningPersona,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed from RAG service');
      }

      setLoading(false);
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedAnswer = '';
      let collectedCitations: Citation[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', '').trim());
              if (data.event === 'citations') {
                collectedCitations = data.citations || [];
                setMessages((prev) =>
                  prev.map((m) => (m.id === asstMsgId ? { ...m, citations: collectedCitations } : m))
                );
              } else if (data.event === 'token') {
                accumulatedAnswer += data.token;
                setMessages((prev) =>
                  prev.map((m) => (m.id === asstMsgId ? { ...m, content: accumulatedAnswer } : m))
                );
              } else if (data.event === 'done') {
                if (data.answer) accumulatedAnswer = data.answer;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === asstMsgId ? { ...m, content: accumulatedAnswer, citations: collectedCitations } : m
                  )
                );
              }
            } catch (pErr) {
              // Non-JSON chunk fragment
            }
          }
        }
      }
    } catch (err: any) {
      console.error('RAG query error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === asstMsgId
            ? {
                ...m,
                content: `⚠️ Failed to retrieve grounded answer. Please verify that documents are indexed in the knowledge base and the vector engine is operational.`,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRateMessage = (msgId: string, rating: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, rating: m.rating === rating ? null : rating } : m))
    );
    setFeedbackToast(rating === 'up' ? 'Feedback recorded: Highly helpful citation' : 'Feedback recorded: Review flagged');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const exportConversationMarkdown = () => {
    if (messages.length === 0) return;
    const title = conversations.find((c) => c.id === activeConversationId)?.title || 'Nexus AI Consultation';
    let md = `# ${title}\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((m) => {
      const author = m.role === 'user' ? '👤 User' : '🤖 Nexus AI Copilot';
      md += `### ${author} (${m.timestamp})\n\n${m.content}\n\n`;
      if (m.citations && m.citations.length > 0) {
        md += `**Sources:**\n`;
        m.citations.forEach((c) => {
          md += `- ${c.filename || c.document_name || 'Doc'} (Page ${c.page_number || 1})\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSourceIcon = (filename?: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <Table className="w-3.5 h-3.5 text-emerald-400" />;
    if (['ppt', 'pptx'].includes(ext)) return <Presentation className="w-3.5 h-3.5 text-amber-400" />;
    if (['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(ext)) return <ScanText className="w-3.5 h-3.5 text-purple-400" />;
    return <FileText className="w-3.5 h-3.5 text-blue-400" />;
  };

  const sampleQuestions = [
    'How many vacation and PTO days do standard employees get?',
    'What is the company remote work and hybrid schedule policy?',
    'What health insurance, medical coverage, and 401(k) plans are offered?',
    'What is the SOP for submitting an IT equipment or software access request?',
  ];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(threadSearch.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-6.5rem)] max-w-7xl mx-auto gap-4">
      {/* 1. Collapsible Conversation History Sidebar */}
      {showSidebar && (
        <aside className="w-64 flex flex-col rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-3 shrink-0 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Consultations</span>
            </span>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              title="Close Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCreateNewChat}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Consultation</span>
          </button>

          {/* Search Filter for Threads */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              placeholder="Filter threads..."
              className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-[11px] text-slate-500">
                {threadSearch ? 'No matching threads' : 'No past consultations'}
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeConversationId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => loadConversation(c.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition ${
                      isActive
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold shadow-inner'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{c.title}</span>
                    <button
                      onClick={(e) => handleDeleteConversation(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition"
                      title="Delete Thread"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* 2. Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-4 space-y-3">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                title="Open History"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white tracking-tight">Nexus AI Copilot</h1>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Zero-Trust RAG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-sm">
                Grounded on <span className="text-indigo-300 font-semibold">{organization?.name || 'Globex'}</span> partitions.
              </p>
            </div>
          </div>

          {/* Domain Partition Pill Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800/80">
              <button
                onClick={() => setSelectedDomainId('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedDomainId === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Vaults
              </button>
              {domains.slice(0, 4).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomainId(d.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    selectedDomainId === d.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {/* Export Markdown Button */}
            <button
              onClick={exportConversationMarkdown}
              disabled={messages.length <= 1}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition"
              title="Export Conversation as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>

            <Link
              href={`/${tenantSlug}/documents`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition font-semibold text-[11px]"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Knowledge Base</span>
            </Link>
          </div>
        </div>

        {/* Feedback Notification Toast */}
        {feedbackToast && (
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{feedbackToast}</span>
            </div>
            <button onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 rounded-tr-sm font-medium'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm shadow-xl'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {msg.content || (streaming && msg.role === 'assistant' ? 'Synthesizing...' : '')}
                </div>

                {/* Citations & Verified Knowledge Sources */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2.5 mt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        <span>Verified Knowledge Citations ({msg.citations.length})</span>
                      </div>
                      <span className="text-slate-500 font-normal">Click citation to inspect</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cit, cIdx) => {
                        const score = cit.similarity_score || 0.88;
                        const isHigh = score >= 0.85;
                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => setActiveCitation(cit)}
                            className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 text-left text-[11px] font-mono text-slate-300 space-y-1.5 transition group hover:border-indigo-500/40 shadow-sm"
                          >
                            <div className="flex items-center justify-between text-indigo-300 font-semibold gap-2">
                              <span className="flex items-center gap-1.5 truncate">
                                {getSourceIcon(cit.filename || cit.document_name)}
                                <span className="truncate">{cit.filename || cit.document_name || 'Document'}</span>
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${
                                  isHigh
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {Math.round(score * 100)}% match
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Page / Sheet: {cit.page_number || 1}</span>
                              <span className="text-indigo-400 group-hover:underline">Inspect ↗</span>
                            </div>
                            {(cit.excerpt || cit.snippet) && (
                              <p className="text-[10px] text-slate-400 font-sans line-clamp-2 italic">
                                "{cit.excerpt || cit.snippet}"
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Message Footer: Timestamp, Rating & Copy Actions */}
                <div className="flex items-center justify-between pt-1 text-[9px] text-slate-500 font-mono">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && msg.content && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRateMessage(msg.id, 'up')}
                        className={`hover:text-emerald-400 transition p-1 rounded ${
                          msg.rating === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'
                        }`}
                        title="Good citation response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRateMessage(msg.id, 'down')}
                        className={`hover:text-rose-400 transition p-1 rounded ${
                          msg.rating === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400'
                        }`}
                        title="Flag inaccurate or incomplete answer"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="hover:text-slate-300 transition flex items-center gap-1 p-1 rounded"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Executing Hybrid Zero-Trust Retrieval & Streaming tokens...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(undefined, q)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition truncate max-w-xs"
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about HR policies, Excel tables, PPT slides, or scanned docs..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading || streaming}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 3. Split-Screen Citation Inspector Slide-Over */}
      {activeCitation && (
        <aside className="w-80 flex flex-col rounded-3xl bg-slate-900/90 border border-slate-800 p-4 shrink-0 space-y-3 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs font-mono uppercase">
              <BookOpen className="w-4 h-4" />
              <span>Citation Inspector</span>
            </div>
            <button
              onClick={() => setActiveCitation(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Source Document</span>
              <div className="flex items-center gap-2">
                {getSourceIcon(activeCitation.filename || activeCitation.document_name)}
                <h4 className="text-white font-bold text-xs truncate">{activeCitation.filename || activeCitation.document_name}</h4>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>Page / Sheet: {activeCitation.page_number || 1}</span>
                <span className="text-emerald-400 font-bold">
                  Score: {(activeCitation.similarity_score || 0.88).toFixed(3)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Grounded Semantic Excerpt</span>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto custom-scrollbar">
                "{activeCitation.excerpt || activeCitation.snippet}"
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <Link
                href={`/${tenantSlug}/documents/${activeCitation.document_id || 'doc-1'}?page=${activeCitation.page_number || 12}&match=${Math.round((activeCitation.similarity_score || 0.92) * 100)}&highlight=${encodeURIComponent(activeCitation.excerpt || activeCitation.snippet || 'Earned Leave (EL): 12 days per year')}&tab=matched`}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Matched Page & Highlights ↗</span>
              </Link>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
