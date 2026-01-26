'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatView } from '@/components/messaging/ChatView';
import { useUser } from '@/firebase';
import { Loader2, MessageSquare } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');
  const { user, isUserLoading } = useUser();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isUserLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return <div className="text-center py-20">Please log in to view your messages.</div>;
  }

  if (isDesktop) {
    return (
      <div className="border bg-background rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[calc(100vh-12rem)]">
        <div className="md:col-span-1 lg:col-span-1 border-r h-full">
          <ConversationList selectedConversationId={conversationId} />
        </div>
        <div className="md:col-span-2 lg:col-span-3 h-full">
          {conversationId ? (
            <ChatView conversationId={conversationId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 gap-4">
              <MessageSquare className="h-16 w-16" />
              <div className='max-w-xs'>
                <h2 className="text-xl font-semibold">Your Messages</h2>
                <p>Choose a conversation from the list to start chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile view
  return (
     <div className="border bg-background rounded-lg shadow-sm h-[calc(100vh-12rem)]">
        {conversationId ? (
            <ChatView conversationId={conversationId} />
        ) : (
            <ConversationList selectedConversationId={null} />
        )}
     </div>
  )
}

export default function MessagesPage() {
    return (
        <div className="py-8">
            <h1 className="font-headline text-4xl font-bold mb-6">Messages</h1>
            <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <MessagesPageContent />
            </Suspense>
        </div>
    );
}
