
'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, getDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { Conversation, Message, User, Booking } from '@/lib/types';
import { Loader2, Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { sendMessage } from '@/lib/messaging-actions';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatDistanceToNow } from 'date-fns';
import { ADMIN_UID } from '@/lib/auth';


// --- Sub-components for the Messages Page ---

function ConversationListItem({ conversation, isSelected }: { conversation: Conversation; isSelected: boolean; }) {
  const { user } = useFirebase();
  const otherParticipantId = conversation.participants.find(p => p !== user?.uid);
  
  if (!otherParticipantId || !user) return null;
  
  const otherParticipantInfo = conversation.participantInfo[otherParticipantId];
  const lastMessage = conversation.lastMessage;
  
  const myReadTimestamp = conversation.readBy?.[user.uid]?.toDate();
  const lastMessageTimestamp = lastMessage?.timestamp?.toDate();

  const isUnread = !!(
    lastMessage &&
    lastMessage.senderId !== user.uid &&
    (!myReadTimestamp || (lastMessageTimestamp && myReadTimestamp < lastMessageTimestamp))
  );
  
  const participantImage = PlaceHolderImages.find(p => p.id === otherParticipantInfo.profilePhotoId);

  return (
    <Link href={`/messages?id=${conversation.id}`} className={cn(
      "block p-3 rounded-lg transition-colors",
      isSelected ? "bg-muted" : "hover:bg-muted/50"
    )}>
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {participantImage && <AvatarImage src={participantImage.imageUrl} alt={otherParticipantInfo.fullName} />}
          <AvatarFallback>{otherParticipantInfo.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold truncate">{otherParticipantInfo.fullName}</h3>
            {lastMessage?.timestamp && (
              <p className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(lastMessage.timestamp.toDate(), { addSuffix: true })}
              </p>
            )}
          </div>
          {lastMessage && (
             <p className={cn(
                "text-sm text-muted-foreground truncate",
                isUnread && "font-bold text-foreground"
            )}>
                {lastMessage.senderId === user.uid && 'You: '}{lastMessage.text}
            </p>
          )}
        </div>
        {isUnread && <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 self-center" />}
      </div>
    </Link>
  );
}

function ConversationList({ selectedConversationId }: { selectedConversationId: string | null }) {
  const { user, firestore } = useFirebase();

  const conversationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const isAdmin = user.uid === ADMIN_UID;
    return isAdmin
      ? query(collection(firestore, 'conversations'), orderBy('updatedAt', 'desc'))
      : query(collection(firestore, 'conversations'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
  }, [user, firestore]);

  const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">You have no conversations</h2>
        <p className="mt-2 text-muted-foreground max-w-xs">
          Once a host confirms your booking, your conversations will appear here.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/discover">Explore Experiences</Link>
          </Button>
        </div>
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

const messageSchema = z.object({
  messageText: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});
type MessageFormValues = z.infer<typeof messageSchema>;

function MessageBubble({ msg, isSender, avatarUrl, name }: { msg: Message; isSender: boolean; avatarUrl?: string, name: string }) {
  return (
    <div className={cn('flex items-end gap-2', isSender ? 'justify-end' : 'justify-start')}>
      {!isSender && (
        <Avatar className="h-8 w-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback>{name ? name.charAt(0) : '?'}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('max-w-[75%] md:max-w-[66%] rounded-lg px-3 py-2 text-sm break-words', isSender ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
        {msg.messageText}
        <div className={cn('text-xs opacity-70 mt-1', isSender ? 'text-right' : 'text-left')}>
          {msg.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? 'sending...'}
        </div>
      </div>
    </div>
  );
}

function ChatView({ conversationId }: { conversationId: string }) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const conversationRef = useMemoFirebase(() => (firestore && conversationId ? doc(firestore, 'conversations', conversationId) : null), [firestore, conversationId]);
  const { data: conversation, isLoading: isConvoLoading } = useDoc<Conversation>(conversationRef);

  const bookingRef = useMemoFirebase(() => (firestore && conversation?.bookingId ? doc(firestore, 'bookings', conversation.bookingId) : null), [firestore, conversation]);
  const { data: booking, isLoading: isBookingLoading } = useDoc<Booking>(bookingRef);
  
  const otherParticipantId = useMemo(() => conversation?.participants.find(p => p !== user?.uid), [conversation, user]);
  
  const otherParticipantRef = useMemoFirebase(() => (firestore && otherParticipantId ? doc(firestore, 'users', otherParticipantId) : null), [firestore, otherParticipantId]);
  const { data: otherParticipant, isLoading: isParticipantLoading } = useDoc<User>(otherParticipantRef);

  const messagesQuery = useMemoFirebase(
    () => firestore && conversationId ? query(collection(firestore, 'conversations', conversationId, 'messages'), orderBy('timestamp', 'asc')) : null,
    [firestore, conversationId]
  );
  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { messageText: '' },
  });
  
  const otherParticipantInfo = useMemo(() => conversation?.participantInfo[otherParticipantId || ''], [conversation, otherParticipantId]);
  const bookingInfo = useMemo(() => conversation?.bookingInfo, [conversation]);

  useEffect(() => {
    if (conversation && conversationRef && user && user.uid && conversation.lastMessage?.senderId !== user.uid) {
      const myReadTimestamp = conversation.readBy?.[user.uid]?.toDate();
      const lastMessageTimestamp = conversation.lastMessage.timestamp?.toDate();
      if (!myReadTimestamp || (lastMessageTimestamp && myReadTimestamp < lastMessageTimestamp)) {
         updateDoc(conversationRef, { [`readBy.${user.uid}`]: serverTimestamp() });
      }
    }
  }, [conversation, conversationRef, user]);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'auto') => {
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior });
  };

  useLayoutEffect(() => {
    scrollToBottom('auto');
  }, [conversationId, messages]);

  async function onSubmit(values: MessageFormValues) {
    if (!firestore || !user || !otherParticipant || !booking) return;

    const currentUserRef = doc(firestore, 'users', user.uid);
    const currentUserSnap = await getDoc(currentUserRef);
    if (!currentUserSnap.exists()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find your user profile.' });
      return;
    }
    const currentUser = { id: currentUserSnap.id, ...currentUserSnap.data() } as User;

    try {
      await sendMessage(firestore, currentUser, otherParticipant, booking, values.messageText);
      form.setValue('messageText', '');
      setTimeout(() => {
          scrollToBottom('smooth');
          inputRef.current?.focus();
      }, 50);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to send message', description: e.message });
    }
  }
  
  const isLoading = isConvoLoading || areMessagesLoading || isBookingLoading || isParticipantLoading;
  const participantImage = otherParticipantInfo ? PlaceHolderImages.find(p => p.id === otherParticipantInfo.profilePhotoId) : null;
  
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex items-center gap-3 shrink-0">
        {!isDesktop && (
          <Button asChild variant="ghost" size="icon" className="-ml-2">
              <Link href="/messages"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
        )}
        {isLoading ? <Skeleton className="h-10 w-10 rounded-full" /> : (
            <Avatar>
                {participantImage && <AvatarImage src={participantImage.imageUrl} />}
                <AvatarFallback>{otherParticipantInfo?.fullName?.charAt(0) ?? '?'}</AvatarFallback>
            </Avatar>
        )}
        <div className="overflow-hidden">
            {isLoading ? <Skeleton className="h-5 w-32 mb-1" /> : <h3 className="font-semibold truncate">{otherParticipantInfo?.fullName}</h3>}
            {isLoading ? <Skeleton className="h-4 w-48" /> : (
                bookingInfo && <Link href={`/experiences/${bookingInfo.experienceId}`} className="text-xs text-muted-foreground hover:underline truncate block">re: {bookingInfo.experienceTitle}</Link>
            )}
        </div>
      </header>
      
      <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {areMessagesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4 rounded-lg" />
              <Skeleton className="h-16 w-3/4 rounded-lg ml-auto" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isSender={msg.senderId === user?.uid}
                name={otherParticipantInfo?.fullName || ''}
                avatarUrl={participantImage?.imageUrl}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground pt-16">
              <p>Your conversation will start here once your booking is confirmed.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background shrink-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-end gap-2">
            <FormField
              control={form.control}
              name="messageText"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      ref={inputRef}
                      placeholder="Type a message..."
                      className="min-h-10 resize-none"
                      rows={1}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.handleSubmit(onSubmit)(); } }}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={form.formState.isSubmitting || !form.formState.isValid || isLoading}>
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}


// --- Main Page Component ---

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');
  const { user, isUserLoading } = useFirebase();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isUserLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return <div className="text-center py-20">Please log in to view your messages.</div>;
  }

  return (
    <div className="border bg-background rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[calc(100vh-12rem)]">
      {isDesktop ? (
        <>
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
        </>
      ) : (
        <div className="col-span-full h-full">
          {conversationId ? <ChatView conversationId={conversationId} /> : <ConversationList selectedConversationId={null} />}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
    return (
        <div className="py-8">
            <h1 className="font-headline text-4xl font-bold mb-6">Messages</h1>
            <Suspense fallback={<div className="flex h-[calc(100vh-12rem)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <MessagesPageContent />
            </Suspense>
        </div>
    );
}
