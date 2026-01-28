'use client';

import {
  Firestore,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { logAudit } from '../audit-actions';
import { User } from '@/lib/types';
import { ADMIN_UID } from '@/lib/auth';

// Function to pause an experience
export async function pauseExperience(
  firestore: Firestore,
  experienceId: string
) {
  const expRef = doc(firestore, 'experiences', experienceId);
  const updatedData = { status: 'paused' };
  try {
    await updateDoc(expRef, updatedData);
    await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'PAUSE_EXPERIENCE', target: { type: 'experience', id: experienceId } });
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
    await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'START_EXPERIENCE', target: { type: 'experience', id: experienceId } });
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: expRef.path,
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
        await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'DELETE_EXPERIENCE_ADMIN', target: { type: 'experience', id: experienceId } });
    } catch(serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: expRef.path,
            operation: 'delete'
        }));
        throw serverError;
    }
}
