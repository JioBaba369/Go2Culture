'use client';

import {
  Firestore,
  doc,
  writeBatch,
  collection,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import type { HostApplication, Host, Experience, User, Job } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Function to approve a host application
export function approveApplication(
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
      hostingStyles: [], // Not collected, can be edited
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

  batch.commit().catch((serverError) => {
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
  });
}

// Function to reject an application
export function rejectApplication(
  firestore: Firestore,
  applicationId: string
) {
  const appRef = doc(firestore, 'hostApplications', applicationId);
  const updatedData = { status: 'Rejected' };
  updateDoc(appRef, updatedData).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: appRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
  });
}

// Function to request changes for an application
export function requestChangesForApplication(
  firestore: Firestore,
  applicationId: string
) {
  const appRef = doc(firestore, 'hostApplications', applicationId);
  const updatedData = { status: 'Changes Needed' };
  updateDoc(appRef, updatedData).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: appRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
  });
}

// Function to pause an experience
export function pauseExperience(
  firestore: Firestore,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'paused' };
  updateDoc(expRef, updatedData).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: expRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
  });
}

// Function to start (make live) an experience
export function startExperience(
  firestore: Firestore,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'live' };
  updateDoc(expRef, updatedData).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: expRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
  });
}

// Function to delete a coupon
export function deleteCoupon(
  firestore: Firestore,
  couponId: string
) {
  const couponRef = doc(firestore, 'coupons', couponId);
  deleteDoc(couponRef).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: couponRef.path,
      operation: 'delete',
    }));
  });
}

// Function to delete a sponsor
export function deleteSponsor(
  firestore: Firestore,
  sponsorId: string
) {
  const sponsorRef = doc(firestore, 'sponsors', sponsorId);
  deleteDoc(sponsorRef).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: sponsorRef.path,
      operation: 'delete',
    }));
  });
}

// Function for admin to update a user's details
export function updateUserByAdmin(
  firestore: Firestore,
  userId: string,
  data: { fullName: string; role: 'guest' | 'host' | 'both'; status: 'active' | 'suspended' | 'deleted' }
) {
  const userRef = doc(firestore, 'users', userId);
  const updatedData = { ...data, updatedAt: serverTimestamp() };
  updateDoc(userRef, updatedData as any).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
  });
}

export function updateReportStatus(
  firestore: Firestore,
  reportId: string,
  status: 'Open' | 'In Progress' | 'Resolved'
) {
  const reportRef = doc(firestore, 'reports', reportId);
  const updatedData = { status };
  updateDoc(reportRef, updatedData).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: reportRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
  });
}

export function deleteExperienceByAdmin(
    firestore: Firestore,
    experienceId: string
) {
    const expRef = doc(firestore, 'experiences', experienceId);
    deleteDoc(expRef).catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: expRef.path,
            operation: 'delete'
        }));
    });
}

// Function to create or update a job posting
export function createOrUpdateJob(
  firestore: Firestore,
  data: Partial<Omit<Job, 'id' | 'createdAt'>>,
  jobId?: string
) {
  let jobRef;
  if (jobId) {
    jobRef = doc(firestore, 'jobs', jobId);
    const updatedData = { ...data, updatedAt: serverTimestamp() };
    updateDoc(jobRef, updatedData as any).catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: jobRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      }));
    });
  } else {
    jobRef = doc(collection(firestore, 'jobs'));
    const newData = { ...data, id: jobRef.id, createdAt: serverTimestamp() };
    setDoc(jobRef, newData).catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: jobRef.path,
        operation: 'create',
        requestResourceData: newData,
      }));
    });
  }
}

// Function to delete a job posting
export function deleteJob(
  firestore: Firestore,
  jobId: string
) {
  const jobRef = doc(firestore, 'jobs', jobId);
  deleteDoc(jobRef).catch((serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: jobRef.path,
      operation: 'delete',
    }));
  });
}
