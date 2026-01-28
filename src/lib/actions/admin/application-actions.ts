
'use client';

import {
  Firestore,
  doc,
  writeBatch,
  collection,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { HostApplication, Host, Experience, User } from '../../types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from '@/lib/notification-actions';
import { logAudit } from '@/lib/audit-actions';
import { ADMIN_UID } from '../../auth';

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
      culturalBackground: '', // Not collected in form, can be edited by host later
      hostingStyles: application.profile.hostingStyles || [],
      achievements: [],
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
    homeSetup: {
      ...application.homeSetup,
      homeType: application.homeSetup.homeType || 'House',
      seating: application.homeSetup.seating || 'Table',
      pets: application.homeSetup.pets || false,
      smoking: application.homeSetup.smoking || false,
    },
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
    hostName: application.hostName,
    hostProfilePhotoId: application.profile.profilePhotoId,
    title: application.experience.title,
    category: application.experience.category as any,
    description: application.experience.description || '',
    durationMinutes: application.experience.durationMinutes,
    menu: {
      cuisine: application.experience.menu.cuisine,
      description: application.experience.menu.description,
      spiceLevel: application.experience.menu.spiceLevel,
      dietary: application.experience.menu.dietary || [],
    },
    pricing: {
      pricePerGuest: application.experience.pricing.pricePerGuest,
      maxGuests: application.experience.pricing.maxGuests,
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
    inclusions: ['A welcome drink', 'All ingredients and equipment'],
    whatToBring: ['Your appetite!', 'A camera to capture the moments'],
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

    await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'APPROVE_APPLICATION', target: { type: 'application', id: application.id } });

    await createNotification(
        firestore,
        application.userId,
        'HOST_APPROVED',
        experienceRef.id,
      );

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
    await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'REJECT_APPLICATION', target: { type: 'application', id: applicationId } });
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
     await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'REQUEST_CHANGES_APPLICATION', target: { type: 'application', id: applicationId } });
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: appRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}
