'use client';

import {
  Firestore,
  doc,
  writeBatch,
  collection,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import type { HostApplication, Host, Experience, User } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Function to approve a host application
export async function approveApplication(
  firestore: Firestore,
  application: HostApplication
) {
  if (!application) {
    throw new Error('Application data is missing.');
  }

  const batch = writeBatch(firestore);

  // 1. Create the new Experience from the application
  const experienceRef = doc(collection(firestore, 'experiences'));
  
  // 2. Update the HostApplication status and link experienceId
  const appRef = doc(firestore, 'hostApplications', application.id);
  batch.update(appRef, { status: 'Approved', experienceId: experienceRef.id });

  // 3. Create the new Host profile
  const hostId = application.userId; // Use userId as the hostId for a 1:1 relationship
  const hostRef = doc(firestore, 'users', application.userId, 'hosts', hostId);
  
  // Construct the new Host object from the application data
  const newHost: Host = {
    id: hostId,
    userId: application.userId,
    name: application.hostName,
    profilePhotoId: application.profile.profilePhotoId,
    status: 'approved',
    profile: {
      bio: application.profile.bio,
      languages: Array.isArray(application.profile.languages) ? application.profile.languages : [application.profile.languages],
      culturalBackground: application.profile.culturalBackground,
      hostingStyles: application.profile.hostingStyles,
    },
    verification: {
      idVerified: true, // Assuming verification is part of approval
      selfieVerified: true,
      verifiedAt: new Date().toISOString(),
    },
    location: {
      country: application.location.country,
      region: application.location.region || '',
      suburb: application.location.suburb || '',
      localArea: application.location.localArea || '',
      postcode: application.location.postcode,
    },
    homeSetup: application.homeSetup,
    compliance: {
        ...application.compliance,
        guidelinesAccepted: true,
    },
    rating: { average: 0, count: 0 },
    createdAt: serverTimestamp(),
  };
  
  batch.set(hostRef, newHost);

  
  const newExperienceData: Experience = {
    id: experienceRef.id,
    hostId: hostId,
    userId: application.userId,
    title: application.experience.title,
    category: application.experience.category as any,
    description: application.experience.description || '',
    durationMinutes: application.experience.durationMinutes,
    menu: {
      ...application.experience.menu,
      dietary: [], // Dietary is missing from application form, default to empty
    },
    pricing: {
      ...application.experience.pricing,
      minGuests: 1,
    },
    availability: {
      days: ['Wednesday', 'Friday', 'Saturday'], // Default availability
      timeSlots: ['19:00'],
    },
    location: {
       country: application.location.country,
       region: application.location.region || '',
       suburb: application.location.suburb || '',
       localArea: application.location.localArea || '',
    },
    photos: {
      mainImageId: application.experience.photos.mainImageId,
      thumbnailImageIds: [],
    },
    instantBook: false,
    status: 'live',
    rating: { average: 0, count: 0 },
    createdAt: serverTimestamp(),
  };
  batch.set(experienceRef, newExperienceData);

  // 4. Update the User's role to 'both' and add location
  const userRef = doc(firestore, 'users', application.userId);
  batch.update(userRef, { 
    role: 'both',
    location: {
      country: application.location.country,
      region: application.location.region || '',
      suburb: application.location.suburb || '',
    }
  });

  try {
    await batch.commit();
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: appRef.path, // Use the application ref path for context
        operation: 'write', // Batch write is a 'write' operation
        requestResourceData: {
          applicationUpdate: { status: 'Approved' },
          newHost,
          newExperience: newExperienceData,
          userUpdate: { role: 'both' },
        }
     }));
     // re-throw the original error to be caught by the UI component
     throw serverError;
  }
}

// Function to reject an application
export async function rejectApplication(
  firestore: Firestore,
  applicationId: string
) {
  const appRef = doc(firestore, 'hostApplications', applicationId);
  const updatedData = { status: 'Rejected' };
  try {
    await updateDoc(appRef, updatedData);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: appRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}

// Function to request changes for an application
export async function requestChangesForApplication(
  firestore: Firestore,
  applicationId: string
) {
  const appRef = doc(firestore, 'hostApplications', applicationId);
  const updatedData = { status: 'Changes Needed' };
  try {
    await updateDoc(appRef, updatedData);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: appRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}

// Function to pause an experience
export async function pauseExperience(
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
export async function startExperience(
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

// Function to delete a coupon
export async function deleteCoupon(
  firestore: Firestore,
  couponId: string
) {
  const couponRef = doc(firestore, 'coupons', couponId);
  try {
    await deleteDoc(couponRef);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: couponRef.path,
      operation: 'delete',
    }));
    throw serverError;
  }
}

// Function to delete a sponsor
export async function deleteSponsor(
  firestore: Firestore,
  sponsorId: string
) {
  const sponsorRef = doc(firestore, 'sponsors', sponsorId);
  try {
    await deleteDoc(sponsorRef);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: sponsorRef.path,
      operation: 'delete',
    }));
    throw serverError;
  }
}

// Function for admin to update a user's details
export async function updateUserByAdmin(
  firestore: Firestore,
  userId: string,
  data: { fullName: string; role: 'guest' | 'host' | 'both'; status: 'active' | 'suspended' | 'deleted' }
) {
  const userRef = doc(firestore, 'users', userId);
  const updatedData = { ...data, updatedAt: serverTimestamp() };
  try {
    await updateDoc(userRef, updatedData as any);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}

export async function updateReportStatus(
  firestore: Firestore,
  reportId: string,
  status: 'Open' | 'In Progress' | 'Resolved'
) {
  const reportRef = doc(firestore, 'reports', reportId);
  const updatedData = { status };
  try {
    await updateDoc(reportRef, updatedData);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: reportRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}

export async function deleteExperienceByAdmin(
    firestore: Firestore,
    experienceId: string
) {
    const expRef = doc(firestore, 'experiences', experienceId);
    try {
        await deleteDoc(expRef);
    } catch(serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: expRef.path,
            operation: 'delete'
        }));
        throw serverError;
    }
}
