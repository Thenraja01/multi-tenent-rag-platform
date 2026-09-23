'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useChatStore } from '@/stores/chat-store';

export default function SingleConversationChatPage() {
  const params = useParams();
  const domainSlug = (params?.domain as string) || 'hr';
  const conversationId = (params?.id as string) || '';
  const { setActiveConversationId } = useChatStore();

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, setActiveConversationId]);

  return (
    <div className="w-full">
      <ChatInterface
        domainId={domainSlug}
        domainName={domainSlug.toUpperCase()}
        domainSlug={domainSlug}
      />
    </div>
  );
}
