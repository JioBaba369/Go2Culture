'use client';

import {
  Firestore,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ADMIN_UID } from '@/lib/auth';
import { logAudit } from '@/lib/audit-actions';
import { User, PlatformSetting } from '@/lib/types';

export async function updateSettings(
  firestore: Firestore,
  settings: Partial<PlatformSetting>
) {
  const settingsRef = doc(firestore, 'platformSettings', 'config');
  const updatedData = { ...settings, updatedAt: serverTimestamp() };

  try {
    // Use set with merge to create the document if it doesn't exist
    await setDoc(settingsRef, updatedData, { merge: true });
    await logAudit(firestore, {
      actor: { id: ADMIN_UID, role: 'admin' } as User,
      action: 'UPDATE_PLATFORM_SETTINGS',
      target: { type: 'platformSettings', id: 'config' },
      metadata: { changes: Object.keys(settings) },
    });
  } catch (serverError) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: settingsRef.path,
        operation: 'write',
        requestResourceData: updatedData,
      })
    );
    throw serverError;
  }
}
