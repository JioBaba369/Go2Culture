
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
import { Job, User } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { logAudit } from '@/lib/audit-actions';
import { ADMIN_UID } from '@/lib/auth';

// Function to create or update a job posting
export function createOrUpdateJob(
  firestore: Firestore,
  data: Partial<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>>,
  jobId?: string
) {
  let jobRef;
  if (jobId) {
    jobRef = doc(firestore, 'jobs', jobId);
    const updatedData = { ...data, updatedAt: serverTimestamp() };
    return updateDoc(jobRef, updatedData as any)
      .then(() => {
        logAudit(firestore, { actor: {id: ADMIN_UID, role: 'admin'} as User, action: 'UPDATE_JOB', target: { type: 'job', id: jobId } });
      })
      .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: jobRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        }));
        throw serverError;
      });
  } else {
    jobRef = doc(collection(firestore, 'jobs'));
    const newData = { ...data, id: jobRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    return setDoc(jobRef, newData)
      .then(() => {
        logAudit(firestore, { actor: {id: ADMIN_UID, role: 'admin'} as User, action: 'CREATE_JOB', target: { type: 'job', id: newData.id } });
      })
      .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: jobRef.path,
          operation: 'create',
          requestResourceData: newData,
        }));
        throw serverError;
      });
  }
}

// Function to delete a job posting
export function deleteJob(
  firestore: Firestore,
  jobId: string
) {
  const jobRef = doc(firestore, 'jobs', jobId);
  return deleteDoc(jobRef)
    .then(() => {
      logAudit(firestore, { actor: {id: ADMIN_UID, role: 'admin'} as User, action: 'DELETE_JOB', target: { type: 'job', id: jobId } });
    })
    .catch((serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: jobRef.path,
        operation: 'delete',
      }));
      throw serverError;
    });
}
