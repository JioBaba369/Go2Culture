'use client';

import {
  Firestore,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { logAudit } from '@/lib/audit-actions';
import { User } from '@/lib/types';
import { ADMIN_UID } from '@/lib/auth';

export function updateStoryStatus(
  firestore: Firestore,
  storyId: string,
  status: 'approved' | 'rejected'
) {
  const storyRef = doc(firestore, 'stories', storyId);
  const updatedData = { status };

  return updateDoc(storyRef, updatedData)
    .then(() => {
        logAudit(firestore, {
            actor: { id: ADMIN_UID, role: 'admin' } as User,
            action: status === 'approved' ? 'APPROVE_STORY' : 'REJECT_STORY',
            target: { type: 'story', id: storyId },
        });
    })
    .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: storyRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        }));
        throw serverError;
    });
}
