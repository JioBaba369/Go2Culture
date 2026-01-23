
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

// Function to approve a host application
export async function approveApplication(
  firestore: Firestore,
  application: HostApplication
): Promise<void> {
  if (!application) throw new Error('Application data is missing.');

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
      state: application.location.state || '',
      suburb: application.location.suburb,
      localArea: application.location.localArea,
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
       state: application.location.state || '',
       suburb: application.location.suburb,
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

  // Commit all the changes atomically
  await batch.commit();
}

// Function to reject an application
export async function rejectApplication(
  firestore: Firestore,
  applicationId: string
): Promise<void> {
  const appRef = doc(firestore, 'hostApplications', applicationId);
  await updateDoc(appRef, { status: 'Rejected' });
}

// Function to request changes for an application
export async function requestChangesForApplication(
  firestore: Firestore,
  applicationId: string
): Promise<void> {
  const appRef = doc(firestore, 'hostApplications', applicationId);
  await updateDoc(appRef, { status: 'Changes Needed' });
}
