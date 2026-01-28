'use client';

import {
  Firestore,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { logAudit } from '../audit-actions';
import { User } from '@/lib/types';
import { ADMIN_UID } from '@/lib/auth';

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
    await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'UPDATE_USER_ADMIN', target: { type: 'user', id: userId }, metadata: { changes: Object.keys(data) } });
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    }));
    throw serverError;
  }
}
