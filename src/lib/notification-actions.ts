
'use client';

import {
  Firestore,
  collection,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

export async function createNotification(
  firestore: Firestore,
  userId: string,
  message: string,
  link?: string
) {
    const notificationData = {
        userId,
        message,
        link: link || '#',
        isRead: false,
        createdAt: serverTimestamp()
    };

    const notifRef = collection(firestore, 'users', userId, 'notifications');
    await addDoc(notifRef, notificationData);
}
