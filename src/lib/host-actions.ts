

'use client';

import {
  Firestore,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  getDoc,
  writeBatch,
  setDoc,
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
  
  const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
  if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
  const actorProfile = actorProfileSnap.data() as AppUser;

  return updateDoc(hostRef, dataToUpdate)
    .then(() => {
      logAudit(firestore, { actor: actorProfile, action: 'UPDATE_PAYOUT_SETTINGS', target: { type: 'user', id: userId } });
    })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: hostRef.path,
        operation: 'update',
        requestResourceData: dataToUpdate,
      }));
      throw serverError;
    });
}

// Function to confirm a booking and create the associated conversation
export async function confirmBooking(
  firestore: Firestore,
  hostAuth: AuthUser, // Actor is an AuthUser
  bookingId: string
) {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  
  // The reads for prerequisite data can be awaited up-front.
  try {
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error("Booking not found!");
    }
    const booking = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;

    const guestRef = doc(firestore, 'users', booking.guestId);
    const hostRef = doc(firestore, 'users', booking.hostId);
    const [guestSnap, hostSnap] = await Promise.all([getDoc(guestRef), getDoc(hostRef)]);

    if (!guestSnap.exists()) throw new Error("Guest profile could not be found.");
    if (!hostSnap.exists()) throw new Error("Host profile could not be found.");
    const guestData = guestSnap.data() as AppUser;
    const hostData = hostSnap.data() as AppUser;

    const bookingUpdateData = { status: 'Confirmed' };
    updateDoc(bookingRef, bookingUpdateData)
      .then(() => {
        // After booking is confirmed, check if conversation exists
        const conversationRef = doc(firestore, 'conversations', booking.id);
        return getDoc(conversationRef).then(conversationSnap => {
            if (!conversationSnap.exists()) {
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
                            fullName: hostData.fullName,
                            profilePhotoId: hostData.profilePhotoId || 'guest-1',
                        },
                    },
                    bookingInfo: {
                        experienceTitle: booking.experienceTitle,
                        experienceId: booking.experienceId,
                    },
                    lastMessage: {
                        senderId: 'system',
                        text: 'Your booking is confirmed! Feel free to coordinate details with your host.',
                        timestamp: serverTimestamp()
                    },
                    readBy: {},
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                // Return this promise to chain it
                return setDoc(conversationRef, conversationData);
            }
            // If it exists, just resolve the promise
            return Promise.resolve();
        });
      })
      .then(() => {
          // This .then() runs after the conversation is created (or found to exist)
          logAudit(firestore, {
              actor: hostData,
              action: 'CONFIRM_BOOKING',
              target: { type: 'booking', id: bookingId }
          });
          createNotification(
            firestore,
            booking.guestId,
            'BOOKING_CONFIRMED',
            booking.id
          );
      })
      .catch(serverError => {
        // This single catch block will handle errors from any of the writes.
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: bookingRef.path, // Use bookingRef path as primary context
          operation: 'write',
          requestResourceData: { bookingUpdate: bookingUpdateData },
        }));
        throw serverError; // Re-throw for the UI to catch
      });

  } catch (readError) {
      // Catch errors from the initial getDoc calls
      console.error("Failed to read required data for booking confirmation:", readError);
      throw readError;
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
      logAudit(firestore, { actor: actorProfile, action: 'CANCEL_BOOKING', target: { type: 'booking', id: bookingId }, metadata: { cancelledBy: 'host' } });
      createNotification(
        firestore,
        booking.guestId,
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


// Function to pause an experience
export async function pauseExperienceForHost(
  firestore: Firestore,
  actorAuth: AuthUser,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'paused' };
  
  const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
  if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
  const actorProfile = actorProfileSnap.data() as AppUser;
  
  return updateDoc(expRef, updatedData)
    .then(() => {
      logAudit(firestore, { actor: actorProfile, action: 'PAUSE_EXPERIENCE', target: { type: 'experience', id: experienceId }});
    })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: expRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      }));
      throw serverError;
    });
}

// Function to start (make live) an experience
export async function startExperienceForHost(
  firestore: Firestore,
  actorAuth: AuthUser,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'live' };

  const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
  if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
  const actorProfile = actorProfileSnap.data() as AppUser;

  return updateDoc(expRef, updatedData)
    .then(() => {
      logAudit(firestore, { actor: actorProfile, action: 'START_EXPERIENCE', target: { type: 'experience', id: experienceId }});
    })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: expRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      }));
      throw serverError;
    });
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
    
    const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
    if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
    const actorProfile = actorProfileSnap.data() as AppUser;

    return updateDoc(expRef, dataWithTimestamp)
      .then(() => {
        logAudit(firestore, { actor: actorProfile, action: 'UPDATE_EXPERIENCE', target: { type: 'experience', id: experienceId }, metadata: { updatedFields: Object.keys(data) } });
      })
      .catch((serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: expRef.path,
              operation: 'update',
              requestResourceData: dataWithTimestamp,
          }));
          throw serverError;
      });
}

// Function to delete an experience
export async function deleteExperienceForHost(
  firestore: Firestore,
  actorAuth: AuthUser,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);

  const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
  if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
  const actorProfile = actorProfileSnap.data() as AppUser;

  return deleteDoc(expRef)
    .then(() => {
        logAudit(firestore, { actor: actorProfile, action: 'DELETE_EXPERIENCE', target: { type: 'experience', id: experienceId }});
    })
    .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: expRef.path,
        operation: 'delete',
        }));
        throw serverError;
    });
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
  
  const actorProfileSnap = await getDoc(doc(firestore, 'users', actorAuth.uid));
  if (!actorProfileSnap.exists()) throw new Error("Actor profile not found.");
  const actorProfile = actorProfileSnap.data() as AppUser;

  return updateDoc(bookingRef, updatedData)
    .then(() => {
        logAudit(firestore, { actor: actorProfile, action: accepted ? 'ACCEPT_RESCHEDULE' : 'DECLINE_RESCHEDULE', target: { type: 'booking', id: bookingId } });
        createNotification(
          firestore,
          booking.guestId,
          'RESCHEDULE_RESPONSE',
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
