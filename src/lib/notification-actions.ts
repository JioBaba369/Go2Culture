
'use client';

import {
  Firestore,
  collection,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import type { Notification } from './types';

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
    await addDoc(notifRef, notificationData);
}
