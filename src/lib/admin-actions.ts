
'use client';

import {
  Firestore,
  doc,
  writeBatch,
  collection,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { HostApplication, Host, Experience } from './types';
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

  // 1. Update the HostApplication status to 'Approved'
  const appRef = doc(firestore, 'hostApplications', application.id);
  batch.update(appRef, { status: 'Approved' });

  // 2. Create the new Host profile
  const hostId = application.userId; // Use userId as the hostId for a 1:1 relationship
  const hostRef = doc(firestore, 'users', application.userId, 'hosts', hostId);
  
  // Construct the new Host object from the application data
  const newHost: Host = {
    id: hostId,
    userId: application.userId,
    name: application.hostName,
    profilePhotoId: application.profile.photoId,
    status: 'approved',
    profile: {
      bio: application.profile.bio,
      languages: application.profile.languages,
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

  // 3. Create the first Experience from the application
  const experienceRef = doc(collection(firestore, 'experiences'));
  const newExperienceData: Experience = {
    id: experienceRef.id,
    hostId: hostId,
    userId: application.userId,
    title: application.experience.title,
    category: application.experience.category as any,
    description: application.experience.description,
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
    status: 'live',
    rating: { average: 0, count: 0 },
    createdAt: serverTimestamp(),
  };
  batch.set(experienceRef, newExperienceData);

  // 4. Update the User's role to 'both' to grant host privileges without removing guest status
  const userRef = doc(firestore, 'users', application.userId);
  batch.update(userRef, { role: 'both' });

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
