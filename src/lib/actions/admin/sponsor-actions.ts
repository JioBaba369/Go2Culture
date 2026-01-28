'use client';

import {
  Firestore,
  doc,
  deleteDoc,
  collection,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ADMIN_UID } from '@/lib/auth';
import { logAudit } from '@/lib/audit-actions';
import { User, Sponsor } from '@/lib/types';

type SponsorFormData = Omit<Sponsor, 'id' | 'createdAt' | 'deletedAt'>;


export async function createOrUpdateSponsor(
    firestore: Firestore,
    data: SponsorFormData,
    sponsorId?: string
) {
    if (sponsorId) {
        const sponsorRef = doc(firestore, 'sponsors', sponsorId);
        const updatedData = { ...data, updatedAt: serverTimestamp() };
        try {
            await updateDoc(sponsorRef, updatedData as any);
            await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'UPDATE_SPONSOR', target: { type: 'sponsor', id: sponsorId } });
        } catch (serverError) {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: sponsorRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            }));
            throw serverError;
        }
    } else {
        const sponsorRef = doc(collection(firestore, 'sponsors'));
        const newData = { ...data, id: sponsorRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
        try {
            await setDoc(sponsorRef, newData);
            await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'CREATE_SPONSOR', target: { type: 'sponsor', id: newData.id } });
        } catch (serverError) {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: sponsorRef.path,
                operation: 'create',
                requestResourceData: newData,
            }));
            throw serverError;
        }
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
     await logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'DELETE_SPONSOR', target: { type: 'sponsor', id: sponsorId } });
  } catch (serverError) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: sponsorRef.path,
      operation: 'delete',
    }));
    throw serverError;
  }
}
