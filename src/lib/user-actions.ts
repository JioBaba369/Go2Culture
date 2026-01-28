
'use client';
import { Firestore, collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { Booking, Review, User as AppUser } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from './notification-actions';
import { logAudit } from './audit-actions';
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
  const actorProfile = actorProfileSnap.data() as AppUser;

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

// Function for a guest to cancel their own booking
export async function cancelBookingByGuest(
  firestore: Firestore,
  actorAuth: AuthUser,
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const updatedData = { status: 'Cancelled', cancellationReason: 'Cancelled by guest' };
  
  const bookingSnap = await getDoc(bookingRef);
  if (!bookingSnap.exists()) {
      throw new Error("Booking not found!");
  }
  const booking = bookingSnap.data() as Booking;

  const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
  if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
  const actorProfile = actorProfileSnap.data() as AppUser;

  return updateDoc(bookingRef, updatedData)
    .then(() => {
      logAudit(firestore, { actor: actorProfile, action: 'CANCEL_BOOKING', target: { type: 'booking', id: bookingId }, metadata: { cancelledBy: 'guest' } });
      createNotification(
          firestore,
          booking.hostId,
          'BOOKING_CANCELLED',
          booking.id
      );
    })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      }));
      throw serverError;
    });
}

export async function requestReschedule(
  firestore: Firestore,
  actorAuth: AuthUser,
  bookingId: string,
  newDate: Date
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  if (!bookingSnap.exists()) throw new Error("Booking not found");

  const booking = bookingSnap.data() as Booking;

  const rescheduleRequest = {
    requestedBy: actorAuth.uid,
    newDate,
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  const updatedData = { rescheduleRequest };

  const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
  if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
  const actorProfile = actorProfileSnap.data() as AppUser;

  return updateDoc(bookingRef, updatedData as any)
    .then(() => {
      logAudit(firestore, { actor: actorProfile, action: 'REQUEST_RESCHEDULE', target: { type: 'booking', id: bookingId }, metadata: { newDate: newDate.toISOString() }});
      createNotification(
        firestore,
        booking.hostId,
        'RESCHEDULE_REQUEST',
        booking.id
      );
    })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      }));
      throw serverError;
    });
}
