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
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import type { Booking, Message, User } from "@/lib/types";
import { addDoc, collection, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

// Consider moving this to a utility or env-based placeholder service
const getProfileImage = (profilePhotoId?: string) => {
  // Replace with real logic (Storage URL, default fallback, etc.)
  return profilePhotoId ? `/images/profiles/${profilePhotoId}.jpg` : null;
};

const messageSchema = z.object({
  messageText: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageDialogProps {
  booking: Booking;
  recipient: User;
  children: React.ReactNode; // usually the trigger button
}

function MessageBubble({
  msg,
  isSender,
  recipient,
}: {
  msg: Message;
  isSender: boolean;
  recipient: User;
}) {
  const imageUrl = getProfileImage(recipient.profilePhotoId);

  return (
    <div className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
      {!isSender && (
        <Avatar className="h-8 w-8 shrink-0">
          {imageUrl && <AvatarImage src={imageUrl} alt={recipient.fullName} />}
          <AvatarFallback>{recipient.fullName?.charAt(0) ?? "?"}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[75%] md:max-w-[66%] rounded-lg px-3 py-2 text-sm break-words",
          isSender
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {msg.messageText}
        <div
          className={cn(
            "text-xs opacity-70 mt-1",
            isSender ? "text-right" : "text-left"
          )}
        >
          {msg.timestamp?.toDate?.()
            ? msg.timestamp.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "sending..."}
        </div>
      </div>
    </div>
  );
}

export function MessageDialog({ booking, recipient, children }: MessageDialogProps) {
  const { firestore, user } = useFirebase();
  const [isOpen, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !isOpen || !booking?.id) return null;
    return query(
      collection(firestore, "messages"),
      where("bookingId", "==", booking.id),
      orderBy("timestamp", "asc")
    );
  }, [firestore, isOpen, booking.id]);

  const { data: messages = [], isLoading } = useCollection<Message>(messagesQuery);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { messageText: "" },
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Better scroll handling
  useLayoutEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Also scroll when opening dialog (after first render)
  useEffect(() => {
    if (isOpen) {
      // small delay to let content render
      const timer = setTimeout(scrollToBottom, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  async function onSubmit(values: MessageFormValues) {
    if (!firestore || !user || !values.messageText.trim()) return;

    const messagesCol = collection(firestore, "messages");

    const messageData = {
      bookingId: booking.id,
      senderId: user.uid,
      receiverId: recipient.id,
      participants: [user.uid, recipient.id],
      messageText: values.messageText.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(messagesCol, messageData);
      form.reset();
      scrollToBottom();
    } catch (err: any) {
      console.error("Failed to send message:", err);

      let title = "Message Not Sent";
      let description = "Something went wrong. Please try again.";

      if (err?.code === "permission-denied") {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: messagesCol.path,
            operation: "create",
            requestResourceData: messageData,
          })
        );
        description = "You don't have permission to send messages in this booking.";
      }

      toast({
        variant: "destructive",
        title,
        description,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px] md:max-w-lg p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Chat with {recipient.fullName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-4 space-y-4 min-h-[200px]">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4 rounded-lg" />
                <Skeleton className="h-16 w-3/4 rounded-lg ml-auto" />
                <Skeleton className="h-10 w-2/5 rounded-lg" />
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isSender={msg.senderId === user?.uid}
                  recipient={recipient}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <p>No messages yet.</p>
                <p className="text-xs mt-2">
                  Start the conversation about "{booking.experienceTitle}"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-background">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex items-end gap-2"
            >
              <FormField
                control={form.control}
                name="messageText"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        placeholder="Type a message..."
                        className="min-h-10 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="icon"
                disabled={form.formState.isSubmitting || !form.formState.isValid}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}