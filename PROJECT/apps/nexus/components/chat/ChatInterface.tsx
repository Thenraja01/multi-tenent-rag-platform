'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useChat } from '../../hooks/use-chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SourcesPanel } from './SourcesPanel';
import { SourceFlyout, CitationSource } from './SourceFlyout';
import {
  Send,
  Square,
  Sparkles,
  Bot,
  User,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Search,
} from 'lucide-react';

interface ChatInterfaceProps {
  domainId?: string;
  domainName?: string;
  domainSlug?: string;
  placeholder?: string;
}

export function ChatInterface({
  domainId,
  domainName = 'Knowledge Base',
  domainSlug = 'general',
  placeholder = 'Ask anything about policies, docs, contracts, or procedures...',
}: ChatInterfaceProps) {
  const params = useParams();
  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    streamingContent,
    streamingSources,
    chatError,
    isLoadingConversations,
    isLoadingMessages,
    sendMessage,
    stopStreaming,
    setActiveConversationId,
    clearActiveChat,
    deleteConversation,
  } = useChat(domainId);

  const [inputQuery, setInputQuery] = useState('');
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [selectedSource, setSelectedSource] = useState<CitationSource | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isStreaming) return;
    const query = inputQuery;
    setInputQuery('');
    await sendMessage(query);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRegenerate = async (messageIndex: number) => {
    if (isStreaming) return;
    // Find the previous user query
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        await sendMessage(messages[i].content);
        break;
      }
    }
  };

  const domainColorMap: Record<string, { badge: string; border: string; glow: string }> = {
    hr: {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      border: 'border-rose-500/30',
      glow: 'from-rose-500/10 to-transparent',
    },
    finance: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      border: 'border-emerald-500/30',
      glow: 'from-emerald-500/10 to-transparent',
    },
    it: {
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      border: 'border-blue-500/30',
      glow: 'from-blue-500/10 to-transparent',
    },
    legal: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      border: 'border-amber-500/30',
      glow: 'from-amber-500/10 to-transparent',
    },
    operations: {
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      border: 'border-purple-500/30',
      glow: 'from-purple-500/10 to-transparent',
    },
  };

  const currentTheme = domainColorMap[domainSlug.toLowerCase()] || {
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    border: 'border-indigo-500/30',
    glow: 'from-indigo-500/10 to-transparent',
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full gap-4 overflow-hidden">
      {/* Left Conversations Sidebar */}
      <div className="hidden md:flex flex-col w-72 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-3 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Threads
            </span>
          </div>
          <button
            onClick={clearActiveChat}
            type="button"
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mt-3 space-y-1 pr-1">
          {isLoadingConversations ? (
            <div className="space-y-2 p-2">
              <div className="h-9 bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="h-9 bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="h-9 bg-slate-800/50 rounded-lg animate-pulse" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-3 text-slate-500 text-xs">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-600" />
              No conversations yet. Start a new topic!
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{c.title || 'Untitled Query'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    type="button"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">{domainName} Copilot</h2>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentTheme.badge}`}
                >
                  {domainSlug} domain
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ground-truth RAG reasoning over tenant-isolated knowledge chunks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              type="button"
              className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                sourcesOpen
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{sourcesOpen ? 'Hide Sources' : 'Show Sources'}</span>
            </button>
          </div>
        </div>

        {/* Message Stream View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto py-12">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-cyan-400/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-500/20">
                  <Bot className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Welcome to Nexus RAG Assistant
              </h3>
              <p className="text-xs text-slate-400 mb-8 max-w-md leading-relaxed">
                Ask anything from your organization&apos;s knowledge base. Get accurate and trusted answers from your documents.
              </p>

              {/* Quick Suggestion Chips matching Screen 1 */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg">
                {[
                  'What is the leave policy?',
                  'Show me attendance rules',
                  'Find HR documents',
                  'How to apply for leave?',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputQuery(preset);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 hover:text-white transition shadow-sm font-medium"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isCopied = copiedMessageId === msg.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex flex-col space-y-1 max-w-[80%]">
                      <div
                        className={`rounded-2xl p-4 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-sm shadow-md'
                            : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div>
                            <MarkdownRenderer content={msg.content} />
                            {msg.sources && msg.sources.length > 0 && (
                              <SourcesPanel
                                sources={msg.sources}
                                isOpen={sourcesOpen}
                                onSelectSource={(s) =>
                                  setSelectedSource({
                                    document_id: s.doc_id || s.document_id || '',
                                    filename: s.filename || 'Document',
                                    page_number: s.page_number || s.page,
                                    similarity_score: s.similarity_score || s.score,
                                    excerpt: s.content || s.chunk || s.excerpt || '',
                                    label: s.label,
                                  })
                                }
                              />
                            )}

                            {/* Assistant Message Actions (Copy & Regenerate) */}
                            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-700/50 text-[11px] text-slate-400">
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 transition"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRegenerate(idx)}
                                disabled={isStreaming}
                                className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 transition disabled:opacity-50"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Regenerate</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] text-slate-500 px-1 font-mono ${isUser ? 'text-right' : 'text-left'}`}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 shrink-0 mt-0.5 shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Streaming Assistant Response */}
              {isStreaming && (
                <div className="flex items-start gap-3.5 justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed bg-slate-800/80 border border-blue-500/30 text-slate-100 rounded-bl-sm shadow-sm">
                    {streamingContent ? (
                      <MarkdownRenderer content={streamingContent} />
                    ) : (
                      <div className="flex items-center gap-2 text-blue-400 text-xs py-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                        <span>Searching domain vectors & synthesizing answer...</span>
                      </div>
                    )}

                    {streamingSources && streamingSources.length > 0 && (
                      <SourcesPanel
                        sources={streamingSources}
                        isOpen={sourcesOpen}
                        onSelectSource={(s) =>
                          setSelectedSource({
                            document_id: s.doc_id || s.document_id || '',
                            filename: s.filename || 'Document',
                            page_number: s.page_number || s.page,
                            similarity_score: s.similarity_score || s.score,
                            excerpt: s.content || s.chunk || s.excerpt || '',
                            label: s.label,
                          })
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {chatError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{chatError}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Attach File, Search Docs, Upload pills (Screen 1 & 2) */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <form onSubmit={handleSend} className="space-y-3">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask a question about your documents..."
                disabled={isStreaming}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-60 pr-14"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopStreaming}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs transition font-medium shadow"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputQuery.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition shadow-md shadow-blue-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick action bar pills matching Screen 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputQuery('Find all uploaded HR policy documents.')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Attach File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputQuery('Search documents for leave policies and attendance rules.')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition"
                >
                  <Search className="w-3.5 h-3.5 text-blue-400" />
                  <span>Search Docs</span>
                </button>
                <Link
                  href={`/${(params?.tenant as string) || 'globex'}/documents`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Upload</span>
                </Link>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline-block">
                Shift + Enter for new line
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Source Citation Flyout Drawer */}
      {selectedSource && (
        <SourceFlyout
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  );
}

