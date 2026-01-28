'use client';
import { Firestore, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Booking, User } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from '@/lib/notification-actions';
import { logAudit } from '@/lib/audit-actions';


// Function for a guest to cancel their own booking
export async function cancelBookingByGuest(
  firestore: Firestore,
  actor: User,
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const updatedData = { status: 'Cancelled', cancellationReason: 'Cancelled by guest' };
  
  const bookingSnap = await getDoc(bookingRef);
  if (!bookingSnap.exists()) {
      throw new Error("Booking not found!");
  }
  const booking = bookingSnap.data() as Booking;

  return updateDoc(bookingRef, updatedData)
    .then(() => {
        logAudit(firestore, { actor, action: 'CANCEL_BOOKING', target: { type: 'booking', id: bookingId }, metadata: { cancelledBy: 'guest' } });
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
  actor: User,
  bookingId: string,
  newDate: Date
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  if (!bookingSnap.exists()) throw new Error("Booking not found");

  const booking = bookingSnap.data() as Booking;

  const rescheduleRequest = {
    requestedBy: actor.id,
    newDate,
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  const updatedData = { rescheduleRequest };

  return updateDoc(bookingRef, updatedData as any)
    .then(() => {
        logAudit(firestore, { actor, action: 'REQUEST_RESCHEDULE', target: { type: 'booking', id: bookingId }, metadata: { newDate: newDate.toISOString() }});
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
