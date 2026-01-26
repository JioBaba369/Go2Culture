'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatView } from '@/components/messaging/ChatView';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    // This case should be handled by a layout, but as a fallback:
    return <div className="text-center py-20">Please log in to view your messages.</div>;
  }

  return (
    <div className="border bg-background rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[calc(100vh-10rem)]">
      <div className="md:col-span-1 lg:col-span-1 border-r h-full">
        <ConversationList selectedConversationId={conversationId} />
      </div>
      <div className="hidden md:block md:col-span-2 lg:col-span-3 h-full">
        {conversationId ? (
          <ChatView conversationId={conversationId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <h2 className="text-xl font-semibold">Select a conversation</h2>
            <p>Choose a conversation from the list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
    return (
        <div className="py-8">
            <h1 className="font-headline text-4xl font-bold mb-6">Messages</h1>
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <MessagesPageContent />
            </Suspense>
        </div>
    );
}
