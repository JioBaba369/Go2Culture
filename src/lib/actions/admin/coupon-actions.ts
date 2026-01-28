
'use client';

import {
  Firestore,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ADMIN_UID } from '@/lib/auth';
import { logAudit } from '@/lib/audit-actions';
import { User, Coupon } from '@/lib/types';

type CouponFormData = Omit<Coupon, 'timesUsed' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export function createOrUpdateCoupon(
    firestore: Firestore,
    data: CouponFormData,
    couponId?: string,
) {
    if (couponId) {
        const couponRef = doc(firestore, 'coupons', couponId);
        const updatedData = { ...data, updatedAt: serverTimestamp() };
        return updateDoc(couponRef, updatedData as any)
            .then(() => {
                logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'UPDATE_COUPON', target: { type: 'coupon', id: couponId } });
            })
            .catch((serverError) => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: couponRef.path,
                    operation: 'update',
                    requestResourceData: updatedData,
                }));
                throw serverError;
            });
    } else {
        const couponRef = doc(firestore, 'coupons', data.id);
        const newData = { ...data, timesUsed: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
        return setDoc(couponRef, newData)
            .then(() => {
                logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'CREATE_COUPON', target: { type: 'coupon', id: newData.id } });
            })
            .catch((serverError) => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: couponRef.path,
                    operation: 'create',
                    requestResourceData: newData,
                }));
                throw serverError;
            });
    }
}

// Function to delete a coupon
export function deleteCoupon(
  firestore: Firestore,
  couponId: string
) {
  const couponRef = doc(firestore, 'coupons', couponId);
  return deleteDoc(couponRef)
    .then(() => {
        logAudit(firestore, { actor: { id: ADMIN_UID, role: 'admin' } as User, action: 'DELETE_COUPON', target: { type: 'coupon', id: couponId } });
    })
    .catch((serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: couponRef.path,
        operation: 'delete',
        }));
        throw serverError;
    });
}
