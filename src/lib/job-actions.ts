'use client';

import {
  Firestore,
  doc,
  collection,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { Job } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Function to create or update a job posting
export async function createOrUpdateJob(
  firestore: Firestore,
  data: Partial<Omit<Job, 'id' | 'createdAt'>>,
  jobId?: string
) {
  let jobRef;
  if (jobId) {
    jobRef = doc(firestore, 'jobs', jobId);
    const updatedData = { ...data, updatedAt: serverTimestamp() };
    try {
      await updateDoc(jobRef, updatedData as any);
    } catch (serverError) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: jobRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      }));
      throw serverError;
    }
  } else {
    jobRef = doc(collection(firestore, 'jobs'));
    const newData = { ...data, id: jobRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    try {
      await setDoc(jobRef, newData);
    } catch (serverError) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: jobRef.path,
        operation: 'create',
        requestResourceData: newData,
      }));
      throw serverError;
    }
  }
}

// Function to delete a job posting
export async function deleteJob(
  firestore: Firestore,
  jobId: string
) {
  const jobRef = doc(firestore, 'jobs', jobId);
  try {
    await deleteDoc(jobRef);
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: jobRef.path,
      operation: 'delete',
    }));
    throw serverError;
  }
}
