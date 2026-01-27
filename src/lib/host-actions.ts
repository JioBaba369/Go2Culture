
'use client';

import {
  Firestore,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Experience, Booking, Conversation, User } from './types';
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

// Function to confirm a booking and create the associated conversation
export async function confirmBooking(
  firestore: Firestore,
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  
  try {
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error("Booking not found!");
    }
    const booking = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;

    // Fetch host and guest profiles to create participantInfo
    const hostRef = doc(firestore, 'users', booking.hostId);
    const guestRef = doc(firestore, 'users', booking.guestId);
    const [hostSnap, guestSnap] = await Promise.all([getDoc(hostRef), getDoc(guestRef)]);

    if (!hostSnap.exists() || !guestSnap.exists()) {
      throw new Error("Host or guest profile could not be found.");
    }
    const hostData = hostSnap.data() as User;
    const guestData = guestSnap.data() as User;
    
    // Start a batch write
    const batch = writeBatch(firestore);

    // 1. Update booking status
    batch.update(bookingRef, { status: 'Confirmed' });

    // 2. Create the conversation document
    const conversationRef = doc(firestore, 'conversations', booking.id);
    const conversationData: Omit<Conversation, 'id'> = {
      bookingId: booking.id,
      participants: [booking.guestId, booking.hostId],
      participantInfo: {
        [booking.guestId]: {
          fullName: guestData.fullName,
          profilePhotoId: guestData.profilePhotoId || 'guest-1',
        },
        [booking.hostId]: {
          fullName: hostData.fullName,
          profilePhotoId: hostData.profilePhotoId || 'guest-1',
        },
      },
      bookingInfo: {
        experienceTitle: booking.experienceTitle,
        experienceId: booking.experienceId,
      },
      lastMessage: undefined, // No messages yet
      readBy: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(conversationRef, conversationData);

    // Commit the batch
    await batch.commit();

    // Send notification after successful commit
    await createNotification(
      firestore,
      booking.guestId,
      `Your booking for "${booking.experienceTitle}" has been confirmed!`,
      '/profile/bookings'
    );
  } catch (serverError) {
    // Note: A more specific error path might be needed depending on which part failed.
    // For simplicity, we use the bookingRef path.
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: bookingRef.path,
      operation: 'write', // This is a batch write operation
      requestResourceData: { status: 'Confirmed' },
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

export async function respondToReschedule(
  firestore: Firestore,
  bookingId: string,
  accepted: boolean
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  if (!bookingSnap.exists()) throw new Error("Booking not found");

  const booking = bookingSnap.data() as Booking;
  if (!booking.rescheduleRequest) throw new Error("No reschedule request found.");

  let updatedData: any;
  if (accepted) {
    updatedData = {
      bookingDate: booking.rescheduleRequest.newDate,
      'rescheduleRequest.status': 'accepted',
    };
  } else {
    updatedData = {
      'rescheduleRequest.status': 'declined',
    };
  }

  try {
    await updateDoc(bookingRef, updatedData);
    await createNotification(
      firestore,
      booking.guestId,
      `Your reschedule request for "${booking.experienceTitle}" was ${accepted ? 'accepted' : 'declined'}.`,
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
