'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Receipt,
  Building2,
  DollarSign,
  Layers,
  RotateCcw,
  Scale,
  Copy,
  Check,
} from 'lucide-react';

interface ChatSource {
  document_name: string;
  page?: number;
  section?: string;
  confidence?: number;
  excerpt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
  timestamp: string;
}

export default function FinanceAiCopilotPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantSlug = (params?.tenant as string) || 'supernova';
  const initialPrompt = searchParams.get('prompt') || '';

  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I am your **NexusRAG Finance AI Copilot**.\n\nI have indexed and vectorized your company's **financial reports, invoices, expense claims, vendor contracts, GST rules, and Ind AS/GAAP standards**.\n\nHow can I assist your finance workflow today?`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // If initialPrompt was provided via URL query parameter, send it automatically
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const suggestedPrompts = [
    {
      label: 'Travel Policy',
      category: 'POLICIES',
      prompt: 'What is our corporate travel and lodging reimbursement policy for Tier-1 cities?',
      icon: FileText,
    },
    {
      label: 'Compare Expenses',
      category: 'EXPENSES',
      prompt: 'Compare Q1 and Q2 operating expenses and identify the biggest cost drivers.',
      icon: TrendingUp,
    },
    {
      label: 'Unpaid Invoices',
      category: 'INVOICES',
      prompt: 'Show all unpaid vendor invoices exceeding ₹1,00,000 and their payment due dates.',
      icon: Receipt,
    },
    {
      label: 'GST & ITC Policy',
      category: 'COMPLIANCE',
      prompt: 'What are the GST requirements and GSTR-2B matching rules for Input Tax Credit claims?',
      icon: Scale,
    },
    {
      label: 'Vendor Payment Terms',
      category: 'VENDORS',
      prompt: 'Compare the credit periods and payment terms of our top vendors (CloudScale vs FinCorp).',
      icon: Building2,
    },
    {
      label: 'Budget Utilization',
      category: 'BUDGETS',
      prompt: 'Which departments are currently exceeding 80% budget utilization this fiscal year?',
      icon: DollarSign,
    },
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.finance.queryCopilot(textToSend, selectedCategory);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer || 'No relevant financial data found for this query.',
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to reach Finance RAG Copilot service. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: `Hello! I am your **NexusRAG Finance AI Copilot**.\n\nI have indexed and vectorized your company's **financial reports, invoices, expense claims, vendor contracts, GST rules, and Ind AS/GAAP standards**.\n\nHow can I assist your finance workflow today?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-6xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/${tenantSlug}/finance`}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Finance AI Copilot
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Postgres pgvector RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cross-document financial insights, statutory policies, invoice analysis & audit citations
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-white transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      {/* Suggested Fast Prompts Carousel */}
      <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {suggestedPrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.prompt)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/90 text-slate-300 hover:text-white text-xs whitespace-nowrap transition group shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-2">
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isAssistant
                    ? 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-emerald-600 text-white font-medium ml-12 shadow-lg shadow-emerald-950/40'
                }`}
              >
                {/* Message Body */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Sources / Citations Section for Assistant responses */}
                {isAssistant && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Verified Citations & Sources</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-white truncate">
                              <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{src.document_name}</span>
                            </div>
                            {src.page && (
                              <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                                Pg {src.page}
                              </span>
                            )}
                          </div>

                          {src.section && (
                            <p className="text-[10px] text-emerald-400/90 font-mono truncate">
                              {src.section}
                            </p>
                          )}

                          {src.excerpt && (
                            <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                              "{src.excerpt}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer timestamp & copy */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>{msg.timestamp}</span>
                  {isAssistant && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                    >
                      {copiedId === msg.id ? (
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
                  )}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Querying PostgreSQL pgvector index and synthesizing financial citations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <div className="pt-3 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask anything about invoices, travel policies, GST compliance, or budget comparisons..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white transition shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>NexusRAG pgvector Domain Model • Ind AS 115 & CGST Compliant</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
