'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useChat } from '@/hooks/use-chat';
import { Clock, MessageSquare, ArrowRight, Trash2 } from 'lucide-react';

export default function ChatHistoryPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const domainSlug = (params?.domain as string) || 'hr';
  const { conversations, isLoadingConversations, deleteConversation } = useChat(domainSlug);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Conversation History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Past AI consultation threads in the {domainSlug.toUpperCase()} domain
          </p>
        </div>

        <Link
          href={`/${tenantSlug}/${domainSlug}/chat`}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition"
        >
          New Chat
        </Link>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        {isLoadingConversations ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading history...</div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No chat history recorded yet for this domain.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {conversations.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{c.title || 'Untitled Consultation'}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/${tenantSlug}/${domainSlug}/chat/${c.id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <span>Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => deleteConversation(c.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
