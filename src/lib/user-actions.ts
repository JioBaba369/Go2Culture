
'use client';
import { Firestore, collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import type { Booking, Review } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function submitReview(
  firestore: Firestore,
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
    await addDoc(reviewsColRef, reviewData);
    // In a real-world scenario, a Cloud Function would trigger here
    // to update the average ratings on the Experience and Host documents.
    // We are not implementing that aggregation on the client-side to maintain
    // security and data integrity.
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
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const updatedData = { status: 'Cancelled' };
  try {
    await updateDoc(bookingRef, updatedData);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: bookingRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}
