
'use client';

import {
  Firestore,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Experience, Booking } from './types';
import { createNotification } from './notification-actions';

export type ExperienceUpdateData = Partial<Omit<Experience, 'id' | 'hostId' | 'userId' | 'createdAt' | 'rating' | 'hostName' | 'hostProfilePhotoId'>>;

export async function updatePayoutSettings(
  firestore: Firestore,
  hostId: string,
  userId: string,
  data: { billingCountry: string }
) {
  const hostRef = doc(firestore, 'users', userId, 'hosts', hostId);
  const dataToUpdate = { ...data, updatedAt: serverTimestamp() };
  try {
    await updateDoc(hostRef, dataToUpdate);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: hostRef.path,
      operation: 'update',
      requestResourceData: dataToUpdate,
    }));
    throw serverError;
  }
}

// Function to confirm a booking
export async function confirmBooking(
  firestore: Firestore,
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const updatedData = { status: 'Confirmed' };
  try {
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error("Booking not found!");
    }
    const booking = bookingSnap.data() as Booking;

    await updateDoc(bookingRef, updatedData);

    await createNotification(
      firestore,
      booking.guestId,
      `Your booking for "${booking.experienceTitle}" has been confirmed!`,
      '/profile/bookings'
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

// Function for a host to cancel a booking
export async function cancelBookingByHost(
  firestore: Firestore,
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

     await createNotification(
      firestore,
      booking.guestId,
      `Your booking for "${booking.experienceTitle}" was cancelled by the host.`,
      '/profile/bookings'
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


// Function to pause an experience
export async function pauseExperienceForHost(
  firestore: Firestore,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'paused' };
  try {
    await updateDoc(expRef, updatedData);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: expRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}

// Function to start (make live) an experience
export async function startExperienceForHost(
  firestore: Firestore,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'live' };
  try {
    await updateDoc(expRef, updatedData);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: expRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}

// Function to update an experience
export async function updateExperience(
  firestore: Firestore,
  experienceId: string,
  data: ExperienceUpdateData
) {
    const expRef = doc(firestore, 'experiences', experienceId);
    const dataWithTimestamp = { ...data, updatedAt: serverTimestamp() };
    try {
        await updateDoc(expRef, dataWithTimestamp);
    } catch(serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: expRef.path,
            operation: 'update',
            requestResourceData: dataWithTimestamp,
        }));
        throw serverError;
    }
}

// Function to delete an experience
export async function deleteExperienceForHost(
  firestore: Firestore,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  try {
    await deleteDoc(expRef);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: expRef.path,
      operation: 'delete',
    }));
    throw serverError;
  }
}
