
'use client';

import {
  Firestore,
  doc,
  collection,
  writeBatch,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Booking, Message, User } from '@/lib/types';
import { createNotification } from './notification-actions';

/**
 * Sends a message and updates the conversation metadata.
 * Assumes the conversation document already exists.
 */
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

  // 2. Update the parent conversation document
  const conversationRef = doc(firestore, 'conversations', booking.id);
  const conversationUpdate = {
    lastMessage: {
      text: messageText.trim(),
      timestamp: serverTimestamp(),
      senderId: currentUser.id,
    },
    // Use dot notation to update only the current user's read timestamp in the map
    [`readBy.${currentUser.id}`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.update(conversationRef, conversationUpdate);

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
        requestResourceData: { newMessage, conversationUpdate },
      })
    );
    throw serverError;
  }
}
