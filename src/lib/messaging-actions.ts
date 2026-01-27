
'use client';

import {
  Firestore,
  doc,
  collection,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Booking, Conversation, Message, User } from '@/lib/types';
import { createNotification } from './notification-actions';

export async function sendMessage(
  firestore: Firestore,
  currentUser: User,
  recipient: User,
  booking: Booking,
  messageText: string
) {
  if (!currentUser || !recipient || !booking || !messageText.trim()) {
    throw new Error('Missing required information to send a message.');
  }

  const batch = writeBatch(firestore);

  // 1. Create the new message document in the subcollection
  const messageRef = doc(collection(firestore, 'conversations', booking.id, 'messages'));
  const newMessage: Omit<Message, 'id'> = {
    bookingId: booking.id,
    senderId: currentUser.id,
    receiverId: recipient.id,
    participants: [currentUser.id, recipient.id],
    messageText: messageText.trim(),
    timestamp: serverTimestamp(),
  };
  batch.set(messageRef, newMessage);

  // 2. Update the conversation document
  const conversationRef = doc(firestore, 'conversations', booking.id);
  const conversationData = {
    lastMessage: {
      text: messageText.trim(),
      timestamp: serverTimestamp(),
      senderId: currentUser.id,
    },
    [`readBy.${currentUser.id}`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.update(conversationRef, conversationData);

  // 3. Add rate limit update to the same batch
  const rateLimitRef = doc(firestore, `users/${currentUser.id}/rateLimits/chat`);
  batch.set(rateLimitRef, { lastMessageAt: serverTimestamp() }, { merge: true });

  try {
    await batch.commit();

    // After message is sent successfully, create notification for the recipient
    await createNotification(
      firestore,
      recipient.id,
      `You have a new message from ${currentUser.fullName}`,
      `/messages?id=${booking.id}`
    );
  } catch (serverError) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `batch write (conversations/${booking.id}, messages, rateLimits)`,
        operation: 'write',
        requestResourceData: { newMessage, conversationData },
      })
    );
    throw serverError;
  }
}
