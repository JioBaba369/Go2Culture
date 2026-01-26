'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Conversation } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { ConversationListItem } from './ConversationListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '../ui/card';
import { ADMIN_UID } from '@/lib/auth';

export function ConversationList({ selectedConversationId }: { selectedConversationId: string | null }) {
  const { user, firestore } = useFirebase();

  const conversationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;

    const isAdmin = user.uid === ADMIN_UID;

    if (isAdmin) {
      // Admin fetches all conversations, ordered by the last message
      return query(
        collection(firestore, 'conversations'),
        orderBy('lastMessage.timestamp', 'desc')
      );
    } else {
      // Regular user only fetches conversations they are a part of
      return query(
        collection(firestore, 'conversations'),
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessage.timestamp', 'desc')
      );
    }
  }, [user, firestore]);

  const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        You have no messages yet.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {conversations.map(convo => (
          <ConversationListItem
            key={convo.id}
            conversation={convo}
            isSelected={selectedConversationId === convo.id}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
