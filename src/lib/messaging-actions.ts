
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

export function sendMessage(
  firestore: Firestore,
  currentUser: User,
  recipient: User,
  booking: Booking,
  messageText: string
): Promise<void> {
  if (!currentUser || !recipient || !booking || !messageText.trim()) {
    return Promise.reject(new Error('Missing required information to send a message.'));
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

  // 2. Update the parent conversation document
  const conversationRef = doc(firestore, 'conversations', booking.id);
  
  // Use dot notation for readBy to avoid overwriting the other user's status.
  const conversationUpdateData = {
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
    lastMessage: {
      text: messageText.trim(),
      timestamp: serverTimestamp(),
      senderId: currentUser.id,
    },
    updatedAt: serverTimestamp(),
    [`readBy.${currentUser.id}`]: serverTimestamp() // Correctly update only the sender's read status
  };

  // Use `update` to ensure the conversation document already exists.
  batch.update(conversationRef, conversationUpdateData);


  return batch.commit()
    .then(() => {
      // After message is sent successfully, create notification for the recipient
      createNotification(
        firestore,
        recipient.id,
        'NEW_MESSAGE',
        booking.id
      );
    })
    .catch((serverError) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `batch write (messages, conversations/${booking.id})`,
          operation: 'write',
          requestResourceData: { newMessage, conversationUpdateData },
        })
      );
      throw serverError;
    });
}
