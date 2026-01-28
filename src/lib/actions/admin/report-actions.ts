
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

export function updateReportStatus(
  firestore: Firestore,
  reportId: string,
  status: 'Open' | 'In Progress' | 'Resolved'
) {
  const reportRef = doc(firestore, 'reports', reportId);
  const updatedData = { status };
  return updateDoc(reportRef, updatedData)
    .then(() => {
        logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'UPDATE_REPORT_STATUS', target: { type: 'report', id: reportId }, metadata: { status } });
    })
    .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: reportRef.path,
        operation: 'update',
        requestResourceData: updatedData,
        }));
        throw serverError;
    });
}
