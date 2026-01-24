
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "../ui/skeleton";
import { ADMIN_UID } from "@/lib/auth";

const messageSchema = z.object({
  messageText: z.string().min(1, "Message cannot be empty."),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageDialogProps {
  booking: Booking;
  recipient: User;
  children: React.ReactNode;
}

export function MessageDialog({ booking, recipient, children }: MessageDialogProps) {
  const { firestore, user } = useFirebase();
  const [isOpen, setOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.uid === ADMIN_UID;

  const messagesQuery = useMemoFirebase(
    () => {
      if (!firestore || !isOpen || !user) return null;
      const baseQuery = collection(firestore, 'messages');

      if (isAdmin) {
        // Admins can query by bookingId directly, as they can read all messages.
        return query(
          baseQuery,
          where('bookingId', '==', booking.id),
          orderBy('timestamp', 'asc')
        );
      }
      // For regular users, the query must check if they are a participant.
      // This is crucial for the security rules to pass.
      return query(
        baseQuery,
        where('bookingId', '==', booking.id),
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp', 'asc')
      );
    },
    [firestore, isOpen, booking.id, user, isAdmin]
  );
  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { messageText: '' },
  });

  async function onSubmit(data: MessageFormValues) {
    if (!firestore || !user) return;
    const messageData = {
      bookingId: booking.id,
      senderId: user.uid,
      receiverId: recipient.id,
      participants: [user.uid, recipient.id],
      messageText: data.messageText,
      timestamp: serverTimestamp(),
    };
    try {
      await addDoc(collection(firestore, 'messages'), messageData);
      form.reset();
    } catch (e) {
      console.error("Failed to send message", e);
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A slight delay to allow the new message to render
        setTimeout(() => {
            if(scrollAreaRef.current) {
                scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    }
  }, [messages]);


  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-[425px] md:max-w-lg grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Chat with {recipient.fullName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
             {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-10 w-3/4 ml-auto" />
                    <Skeleton className="h-10 w-3/4" />
                </div>
            ) : messages && messages.length > 0 ? (
              messages.map(msg => {
                const isSender = msg.senderId === user?.uid;
                const senderImage = PlaceHolderImages.find(p => p.id === (isSender ? user?.photoURL : recipient?.profilePhotoId));
                const senderName = isSender ? user?.displayName : recipient.fullName;

                return (
                  <div key={msg.id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                     {!isSender && (
                        <Avatar className="h-8 w-8">
                            {senderImage && <AvatarImage src={senderImage.imageUrl} />}
                            <AvatarFallback>{senderName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                     )}
                     <div className={cn("max-w-xs md:max-w-sm rounded-lg px-3 py-2 text-sm", 
                        isSender ? "bg-primary text-primary-foreground" : "bg-muted"
                     )}>
                        {msg.messageText}
                     </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center text-muted-foreground pt-16">
                  <p>No messages yet.</p>
                  <p className="text-xs">Start the conversation about your booking for "{booking.experienceTitle}".</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-center gap-2">
              <FormField
                control={form.control}
                name="messageText"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea placeholder="Type a message..." {...field} className="min-h-0 h-10 resize-none" />
                    </FormControl>
                    <FormMessage />
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
