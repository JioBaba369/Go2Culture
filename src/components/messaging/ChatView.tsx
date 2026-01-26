
'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { Conversation, Message, User, Booking } from '@/lib/types';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
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
import Link from 'next/link';
import { useMediaQuery } from '@/hooks/use-media-query';

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
          <AvatarFallback>{name.charAt(0) ?? '?'}</AvatarFallback>
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

export function ChatView({ conversationId }: { conversationId: string }) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const conversationRef = useMemoFirebase(() => (firestore && conversationId ? doc(firestore, 'conversations', conversationId) : null), [firestore, conversationId]);
  const { data: conversation, isLoading: isConvoLoading } = useDoc<Conversation>(conversationRef);

  const messagesQuery = useMemoFirebase(() => (firestore && conversationId ? query(collection(firestore, 'messages'), where('bookingId', '==', conversationId), orderBy('timestamp', 'asc')) : null), [firestore, conversationId]);
  
  const { data: messages = [], isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { messageText: '' },
  });
  
  const otherParticipantId = conversation?.participants.find(p => p !== user?.uid);
  const otherParticipantInfo = otherParticipantId ? conversation?.participantInfo[otherParticipantId] : null;

  // Mark conversation as read
  useEffect(() => {
    if (conversation && user && conversation.readBy && !conversation.readBy.includes(user.uid)) {
      updateDoc(conversationRef!, {
        readBy: arrayUnion(user.uid),
      });
    }
  }, [conversation, user, conversationRef]);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'auto') => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useLayoutEffect(() => {
    scrollToBottom('auto');
  }, [conversationId, messages]);


  async function onSubmit(values: MessageFormValues) {
    if (!firestore || !user || !otherParticipantId || !otherParticipantInfo || !conversation) return;
    
    const recipientRef = doc(firestore, 'users', otherParticipantId);
    const recipientSnap = await getDoc(recipientRef);
    if (!recipientSnap.exists()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find recipient.' });
        return;
    }
    const recipient = { id: recipientSnap.id, ...recipientSnap.data() } as User;

    const currentUserRef = doc(firestore, 'users', user.uid);
    const currentUserSnap = await getDoc(currentUserRef);
     if (!currentUserSnap.exists()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find your user profile.' });
        return;
    }
    const currentUser = { id: currentUserSnap.id, ...currentUserSnap.data() } as User;

    try {
      await sendMessage(firestore, currentUser, recipient, { id: conversation.id, experienceTitle: conversation.bookingInfo.experienceTitle, experienceId: conversation.bookingInfo.experienceId } as Booking, values.messageText);
      form.reset();
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to send message', description: e.message });
    }
  }
  
  const isLoading = isConvoLoading || areMessagesLoading;
  const participantImage = otherParticipantInfo ? PlaceHolderImages.find(p => p.id === otherParticipantInfo.profilePhotoId) : null;
  
  return (
    <div className="flex flex-col h-full">
      {isLoading || !otherParticipantInfo ? (
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-48" />
        </div>
      ) : (
        <header className="p-4 border-b flex items-center gap-3">
          {!isDesktop && (
            <Button asChild variant="ghost" size="icon" className="-ml-2">
                <Link href="/messages">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
          )}
          <Avatar>
            {participantImage && <AvatarImage src={participantImage.imageUrl} />}
            <AvatarFallback>{otherParticipantInfo.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherParticipantInfo.fullName}</h3>
            <Link href={`/experiences/${conversation?.bookingInfo.experienceId}`} className="text-xs text-muted-foreground hover:underline truncate">
              re: {conversation?.bookingInfo.experienceTitle}
            </Link>
          </div>
        </header>
      )}
      
      <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4 rounded-lg" />
              <Skeleton className="h-16 w-3/4 rounded-lg ml-auto" />
            </div>
          ) : messages.length > 0 ? (
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
              <p>No messages yet. Say hello!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-end gap-2">
            <FormField
              control={form.control}
              name="messageText"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
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
            <Button type="submit" size="icon" disabled={form.formState.isSubmitting || !form.formState.isValid}>
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
