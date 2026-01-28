'use client';
import { Firestore, collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { Booking, Review, User } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from '../notification-actions';
import { logAudit } from '../audit-actions';

export async function submitReview(
  firestore: Firestore,
  actor: User,
  booking: Booking,
  rating: number,
  comment: string
) {
  if (!booking.guestId || !booking.experienceId || !booking.hostId) {
    throw new Error('Booking is missing necessary information.');
  }

  const reviewData: Omit<Review, 'id'> = {
    bookingId: booking.id,
    guestId: booking.guestId,
    experienceId: booking.experienceId,
    hostId: booking.hostId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  };

  const reviewsColRef = collection(firestore, 'reviews');
  try {
    const newReviewRef = await addDoc(reviewsColRef, reviewData);
    
    await logAudit(firestore, { actor, action: 'CREATE_REVIEW', target: { type: 'review', id: newReviewRef.id }, metadata: { bookingId: booking.id, experienceId: booking.experienceId, rating } });

    await createNotification(
      firestore,
      booking.hostId,
      'REVIEW_RECEIVED',
      booking.experienceId,
    );
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: reviewsColRef.path,
      operation: 'create',
      requestResourceData: reviewData,
    }));
    throw serverError;
  }
}
