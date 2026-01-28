'use client';

import {
  Firestore,
  collection,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import type { Notification } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function createNotification(
  firestore: Firestore,
  userId: string,
  type: Notification['type'],
  entityId: string,
) {
    if (!userId || !type || !entityId) {
        console.error("Missing required information to create a notification.");
        return;
    }
    
    const notificationData: Omit<Notification, 'id'> = {
        userId,
        type,
        entityId,
        isRead: false,
        createdAt: serverTimestamp()
    };

    const notifRef = collection(firestore, 'users', userId, 'notifications');
    
    try {
        await addDoc(notifRef, notificationData);
    } catch (serverError) {
        // Instead of throwing, we emit a non-blocking error.
        // This ensures that the primary action (e.g., sending a message)
        // doesn't fail just because the notification could not be created.
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: notifRef.path,
                operation: 'create',
                requestResourceData: notificationData,
            })
        );
    }
}
