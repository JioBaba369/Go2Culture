
'use client';
import { Firestore, collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { Booking, Review, User } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from './notification-actions';
import { logAudit } from './audit-actions';

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
      `You received a new ${rating}-star review for "${booking.experienceTitle}"!`,
      `/experiences/${booking.experienceId}`
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

// Function for a guest to cancel their own booking
export async function cancelBookingByGuest(
  firestore: Firestore,
  actor: User,
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const updatedData = { status: 'Cancelled' };
  try {
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
        throw new Error("Booking not found!");
    }
    const booking = bookingSnap.data() as Booking;

    await updateDoc(bookingRef, updatedData);

    await logAudit(firestore, { actor, action: 'CANCEL_BOOKING', target: { type: 'booking', id: bookingId }, metadata: { cancelledBy: 'guest' } });

    await createNotification(
        firestore,
        booking.hostId,
        `Your booking for "${booking.experienceTitle}" was cancelled by the guest.`,
        '/host/bookings'
    );
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: bookingRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}

export async function requestReschedule(
  firestore: Firestore,
  actor: User,
  bookingId: string,
  newDate: Date
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  if (!bookingSnap.exists()) throw new Error("Booking not found");

  const booking = bookingSnap.data() as Booking;

  const rescheduleRequest = {
    requestedBy: booking.guestId,
    newDate,
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  const updatedData = { rescheduleRequest };

  try {
    await updateDoc(bookingRef, updatedData as any);
    
    await logAudit(firestore, { actor, action: 'REQUEST_RESCHEDULE', target: { type: 'booking', id: bookingId }, metadata: { newDate: newDate.toISOString() }});

    await createNotification(
      firestore,
      booking.hostId,
      `${actor.fullName} requested to reschedule "${booking.experienceTitle}".`,
      '/host/bookings'
    );
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: bookingRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}
