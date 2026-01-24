
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import type { Booking, Message, User } from "@/lib/types";
import { addDoc, collection, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

const messageSchema = z.object({
  messageText: z.string().min(1, "Message cannot be empty."),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageDialogProps {
  booking: Booking;
  recipient: User;
  children: React.ReactNode;
}

function MessageBubble({ msg, isSender, recipient }: { msg: Message, isSender: boolean, recipient: User }) {
    return (
        <div className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
            {!isSender && (
                <Avatar className="h-8 w-8">
                    {recipient.profilePhotoURL && <AvatarImage src={recipient.profilePhotoURL} alt={recipient.fullName} />}
                    <AvatarFallback>{recipient.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn("max-w-xs md:max-w-sm rounded-lg px-3 py-2 text-sm", 
                isSender ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
                {msg.messageText}
                <div className={cn("text-xs opacity-70 mt-1", isSender ? "text-right" : "text-left")}>
                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </div>
            </div>
        </div>
    )
}

export function MessageDialog({ booking, recipient, children }: MessageDialogProps) {
  const { firestore, user } = useFirebase();
  const [isOpen, setOpen] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messagesQuery = useMemoFirebase(
    () => {
      if (!firestore || !isOpen) return null;
      return query(
        collection(firestore, 'messages'),
        where('bookingId', '==', booking.id),
        orderBy('timestamp', 'asc')
      );
    },
    [firestore, isOpen, booking.id]
  );
  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { messageText: '' },
  });

  async function onSubmit(data: MessageFormValues) {
    if (!firestore || !user || !data.messageText.trim()) return;
    
    const messagesColRef = collection(firestore, 'messages');
    const messageData = {
      bookingId: booking.id,
      senderId: user.uid,
      receiverId: recipient.id,
      participants: [user.uid, recipient.id],
      messageText: data.messageText,
      timestamp: serverTimestamp(),
    };
    
    addDoc(messagesColRef, messageData)
      .then(() => {
        form.reset();
      })
      .catch(serverError => {
        console.error("Failed to send message", serverError);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: messagesColRef.path,
            operation: 'create',
            requestResourceData: messageData
        }));
        toast({
            variant: "destructive",
            title: "Message Not Sent",
            description: "Could not send your message. Please try again."
        });
      });
  }

  useEffect(() => {
    if (scrollViewportRef.current) {
        setTimeout(() => {
            if(scrollViewportRef.current) {
                scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    }
  }, [messages]);


  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-[425px] md:max-w-lg grid-rows-[auto_1fr_auto] p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Chat with {recipient.fullName}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
          <div className="p-4 space-y-4">
             {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-3/4 rounded-lg" />
                    <Skeleton className="h-16 w-3/4 rounded-lg ml-auto" />
                    <Skeleton className="h-10 w-2/4 rounded-lg" />
                </div>
            ) : messages && messages.length > 0 ? (
              messages.map(msg => (
                 <MessageBubble key={msg.id} msg={msg} isSender={msg.senderId === user?.uid} recipient={recipient} />
              ))
            ) : (
              <div className="text-center text-muted-foreground pt-16">
                  <p>No messages yet.</p>
                  <p className="text-xs">Start the conversation about your booking for "{booking.experienceTitle}".</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-4 border-t bg-background">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-start gap-2">
              <FormField
                control={form.control}
                name="messageText"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea 
                        placeholder="Type a message..." 
                        {...field} 
                        className="min-h-0 h-10 resize-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                            }
                        }}
                       />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
              </Button>
            </form>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    