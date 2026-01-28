
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
  const conversationRef = doc(firestore, 'conversations', booking.id);

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

  // 2. Prepare the update for the conversation document.
  const conversationUpdate = {
    lastMessage: {
      text: messageText.trim(),
      timestamp: serverTimestamp(),
      senderId: currentUser.id,
    },
    updatedAt: serverTimestamp(),
    // Update participant info in case a user's details have changed
    [`participantInfo.${currentUser.id}`]: {
        fullName: currentUser.fullName,
        profilePhotoId: currentUser.profilePhotoId || 'guest-1',
    },
    [`participantInfo.${recipient.id}`]: {
        fullName: recipient.fullName,
        profilePhotoId: recipient.profilePhotoId || 'guest-1',
    },
    [`readBy.${currentUser.id}`]: serverTimestamp(),
  };

  // Use `update` which supports dot notation and won't overwrite the entire `readBy` map.
  // This assumes the conversation document has already been created, which happens upon booking confirmation.
  batch.update(conversationRef, conversationUpdate);

  // 3. Add rate limit update to the same batch to enforce security rules
  const rateLimitRef = doc(firestore, `users/${currentUser.id}/rateLimits/chat`);
  batch.set(rateLimitRef, { lastMessageAt: serverTimestamp() }, { merge: true });

  try {
    await batch.commit();

    // After message is sent successfully, create notification for the recipient
    await createNotification(
      firestore,
      recipient.id,
      'NEW_MESSAGE',
      booking.id
    );
  } catch (serverError) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `batch write (messages, conversations/${booking.id})`,
        operation: 'write',
        requestResourceData: { newMessage, conversationUpdate },
      })
    );
    throw serverError;
  }
}
