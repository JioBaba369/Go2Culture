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
import { logAudit } from './audit-actions';

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

  // 2. Create or update the conversation document. 
  // Using set with merge:true allows this to work for the first message (creation)
  // and subsequent messages (update).
  const conversationData: Partial<Conversation> = {
    id: booking.id, // Ensure ID is set on creation
    bookingId: booking.id,
    participants: [currentUser.id, recipient.id],
    participantInfo: {
      [currentUser.id]: {
        fullName: currentUser.fullName,
        profilePhotoId: currentUser.profilePhotoId || 'guest-1',
      },
      [recipient.id]: {
        fullName: recipient.fullName,
        profilePhotoId: recipient.profilePhotoId || 'guest-1',
      },
    },
    bookingInfo: {
      experienceTitle: booking.experienceTitle,
      experienceId: booking.experienceId,
    },
    lastMessage: {
      text: messageText.trim(),
      timestamp: serverTimestamp(),
      senderId: currentUser.id,
    },
    readBy: {
      [currentUser.id]: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  };
  // On first message, create the doc. On subsequent, merge fields.
  batch.set(conversationRef, conversationData, { merge: true });
  
  // 3. Add rate limit update to the same batch
  const rateLimitRef = doc(firestore, `users/${currentUser.id}/rateLimits/chat`);
  batch.set(rateLimitRef, { lastMessageAt: serverTimestamp() }, { merge: true });

  try {
    await batch.commit();

    await logAudit(firestore, { actor: currentUser, action: 'SEND_MESSAGE', target: { type: 'conversation', id: booking.id }, metadata: { messageLength: messageText.trim().length }});

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
        requestResourceData: { newMessage, conversationData },
      })
    );
    throw serverError;
  }
}
