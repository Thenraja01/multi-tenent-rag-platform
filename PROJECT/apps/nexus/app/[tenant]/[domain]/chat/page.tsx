'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function DomainChatPage() {
  const params = useParams();
  const domainSlug = (params?.domain as string) || 'hr';
  const domainName = domainSlug.toUpperCase();

  return (
    <div className="w-full">
      <ChatInterface
        domainId={domainSlug}
        domainName={domainName}
        domainSlug={domainSlug}
        placeholder={`Ask anything about ${domainName} procedures, uploaded documents, or compliance...`}
      />
    </div>
  );
}
