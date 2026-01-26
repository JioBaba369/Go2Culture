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

  // 1. Create the new message document
  const messageRef = doc(collection(firestore, 'messages'));
  const newMessage: Omit<Message, 'id'> = {
    bookingId: booking.id,
    senderId: currentUser.id,
    receiverId: recipient.id,
    participants: [currentUser.id, recipient.id],
    messageText: messageText.trim(),
    timestamp: serverTimestamp(),
  };
  batch.set(messageRef, newMessage);

  // 2. Create or update the conversation document
  const conversationRef = doc(firestore, 'conversations', booking.id);
  const conversationData: Conversation = {
    id: booking.id,
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
    readBy: [currentUser.id], // The sender has "read" it.
  };

  // Using set with merge: true will create if not exists, and update if it does.
  batch.set(conversationRef, conversationData, { merge: true });

  try {
    await batch.commit();
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
