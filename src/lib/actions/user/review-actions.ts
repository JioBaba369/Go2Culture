
'use client';
import { Firestore, collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import type { Booking, Review, User as AppUser } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from '@/lib/notification-actions';
import { logAudit } from '@/lib/audit-actions';
import type { User as AuthUser } from 'firebase/auth';

export async function submitReview(
  firestore: Firestore,
  actorAuth: AuthUser,
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

  const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
  if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
  const actorProfile = { id: actorProfileSnap.id, ...actorProfileSnap.data() } as AppUser;

  return addDoc(reviewsColRef, reviewData)
    .then((newReviewRef) => {
      logAudit(firestore, { actor: actorProfile, action: 'CREATE_REVIEW', target: { type: 'review', id: newReviewRef.id }, metadata: { bookingId: booking.id, experienceId: booking.experienceId, rating } });
      createNotification(
        firestore,
        booking.hostId,
        'REVIEW_RECEIVED',
        booking.experienceId,
      );
    })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: reviewsColRef.path,
        operation: 'create',
        requestResourceData: reviewData,
      }));
      throw serverError;
    });
}
