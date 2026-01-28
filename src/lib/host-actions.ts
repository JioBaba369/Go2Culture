
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
import type { Experience, Booking, Conversation, User as AppUser } from './types';
import { createNotification } from './notification-actions';
import { logAudit } from './audit-actions';
import type { User as AuthUser } from 'firebase/auth';

export type ExperienceUpdateData = Partial<Omit<Experience, 'id' | 'hostId' | 'userId' | 'createdAt' | 'rating' | 'hostName' | 'hostProfilePhotoId'>>;

export async function updatePayoutSettings(
  firestore: Firestore,
  actorAuth: AuthUser,
  hostId: string,
  userId: string,
  data: { billingCountry: string }
) {
  const hostRef = doc(firestore, 'users', userId, 'hosts', hostId);
  const dataToUpdate = { ...data, updatedAt: serverTimestamp() };
  try {
    const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
    if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
    const actorProfile = actorProfileSnap.data() as AppUser;

    await updateDoc(hostRef, dataToUpdate);
    await logAudit(firestore, { actor: actorProfile, action: 'UPDATE_PAYOUT_SETTINGS', target: { type: 'user', id: userId } });
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
  hostAuth: AuthUser, // Actor is an AuthUser
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  
  try {
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error("Booking not found!");
    }
    const booking = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;

    // Fetch guest and host AppUser profiles from firestore
    const guestRef = doc(firestore, 'users', booking.guestId);
    const hostRef = doc(firestore, 'users', booking.hostId);
    const [guestSnap, hostSnap] = await Promise.all([getDoc(guestRef), getDoc(hostRef)]);


    if (!guestSnap.exists()) {
      throw new Error("Guest profile could not be found.");
    }
    if (!hostSnap.exists()) {
        throw new Error("Host profile could not be found.");
    }
    const guestData = guestSnap.data() as AppUser;
    const hostData = hostSnap.data() as AppUser;

    // Start a batch write
    const batch = writeBatch(firestore);

    // 1. Update booking status
    batch.update(bookingRef, { status: 'Confirmed' });

    // 2. Create the conversation document
    const conversationRef = doc(firestore, 'conversations', booking.id);
    const conversationData: Conversation = {
      id: booking.id,
      bookingId: booking.id,
      participants: [booking.guestId, booking.hostId],
      participantInfo: {
        [booking.guestId]: {
          fullName: guestData.fullName,
          profilePhotoId: guestData.profilePhotoId || 'guest-1',
        },
        [booking.hostId]: {
          fullName: hostData.fullName, // Use fetched profile
          profilePhotoId: hostData.profilePhotoId || 'guest-1', // Use fetched profile
        },
      },
      bookingInfo: {
        experienceTitle: booking.experienceTitle,
        experienceId: booking.experienceId,
      },
      readBy: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(conversationRef, conversationData);

    // Commit the batch
    await batch.commit();

    // Log the audit event
    await logAudit(firestore, {
        actor: hostData, // Pass the full host profile
        action: 'CONFIRM_BOOKING',
        target: { type: 'booking', id: bookingId }
    });

    // Send notification after successful commit
    await createNotification(
      firestore,
      booking.guestId,
      'BOOKING_CONFIRMED',
      booking.id
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
  actorAuth: AuthUser,
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const updatedData = { status: 'Cancelled', cancellationReason: 'Cancelled by host' };
  try {
     const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error("Booking not found!");
    }
    const booking = bookingSnap.data() as Booking;

     const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
     if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
     const actorProfile = actorProfileSnap.data() as AppUser;

    await updateDoc(bookingRef, updatedData);
    
    await logAudit(firestore, { actor: actorProfile, action: 'CANCEL_BOOKING', target: { type: 'booking', id: bookingId }, metadata: { cancelledBy: 'host' } });

     await createNotification(
      firestore,
      booking.guestId,
      'BOOKING_CANCELLED',
      booking.id
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
  actorAuth: AuthUser,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'paused' };
  try {
    const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
    if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
    const actorProfile = actorProfileSnap.data() as AppUser;

    await updateDoc(expRef, updatedData);
    await logAudit(firestore, { actor: actorProfile, action: 'PAUSE_EXPERIENCE', target: { type: 'experience', id: experienceId }});
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
  actorAuth: AuthUser,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'live' };
  try {
    const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
    if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
    const actorProfile = actorProfileSnap.data() as AppUser;

    await updateDoc(expRef, updatedData);
    await logAudit(firestore, { actor: actorProfile, action: 'START_EXPERIENCE', target: { type: 'experience', id: experienceId }});
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
  actorAuth: AuthUser,
  experienceId: string,
  data: ExperienceUpdateData
) {
    const expRef = doc(firestore, 'experiences', experienceId);
    const dataWithTimestamp = { ...data, updatedAt: serverTimestamp() };
    try {
        const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
        if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
        const actorProfile = actorProfileSnap.data() as AppUser;

        await updateDoc(expRef, dataWithTimestamp);
        await logAudit(firestore, { actor: actorProfile, action: 'UPDATE_EXPERIENCE', target: { type: 'experience', id: experienceId }, metadata: { updatedFields: Object.keys(data) } });
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
  actorAuth: AuthUser,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  try {
    const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
    if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
    const actorProfile = actorProfileSnap.data() as AppUser;

    await deleteDoc(expRef);
    await logAudit(firestore, { actor: actorProfile, action: 'DELETE_EXPERIENCE', target: { type: 'experience', id: experienceId }});
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
  actorAuth: AuthUser,
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
      rescheduleRequest: {
        ...booking.rescheduleRequest,
        status: 'accepted',
      },
    };
  } else {
    updatedData = {
      rescheduleRequest: {
        ...booking.rescheduleRequest,
        status: 'declined',
      },
    };
  }

  try {
    const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
    if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
    const actorProfile = actorProfileSnap.data() as AppUser;

    await updateDoc(bookingRef, updatedData);

    await logAudit(firestore, { actor: actorProfile, action: accepted ? 'ACCEPT_RESCHEDULE' : 'DECLINE_RESCHEDULE', target: { type: 'booking', id: bookingId } });
    
    await createNotification(
      firestore,
      booking.guestId,
      'RESCHEDULE_RESPONSE',
      booking.id
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
