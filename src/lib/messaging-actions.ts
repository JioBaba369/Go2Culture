
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
    messageText: messageText.trim(),
    timestamp: serverTimestamp(),
  };
  batch.set(messageRef, newMessage);

  // 2. Create or update the conversation document
  const conversationRef = doc(firestore, 'conversations', booking.id);
  
  // This data will be merged into an existing document or used to create a new one.
  const conversationUpdateData = {
    id: booking.id,
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
    updatedAt: serverTimestamp(),
  };

  // Use set with merge to create the doc if it doesn't exist,
  // or update it if it does. `createdAt` will only be set once.
  batch.set(conversationRef, {
    ...conversationUpdateData,
    createdAt: serverTimestamp(),
  }, { merge: true });

  // Separately update the `readBy` map to avoid overwriting it.
  // This uses dot notation to update a specific field in the map.
  batch.update(conversationRef, {
      [`readBy.${currentUser.id}`]: serverTimestamp()
  });


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
        requestResourceData: { newMessage, conversationUpdateData },
      })
    );
    throw serverError;
  }
}

