
'use client';

import { Firestore, collection, serverTimestamp, addDoc } from 'firebase/firestore';
import type { User, AuditLog } from './types';

type AuditLogPayload = {
    actor: User;
    action: string;
    target: { type: AuditLog['targetType']; id: string; };
    metadata?: Record<string, any>;
}

export async function logAudit(firestore: Firestore, payload: AuditLogPayload) {
    if (!firestore || !payload.actor) {
        console.error("Firestore or actor not available for audit logging.");
        return;
    }

    const auditData: Omit<AuditLog, 'id'> = {
        actorId: payload.actor.id,
        actorRole: payload.actor.role,
        action: payload.action,
        targetType: payload.target.type,
        targetId: payload.target.id,
        metadata: payload.metadata || {},
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(firestore, 'auditLogs'), auditData);
    } catch (e) {
        console.error("Failed to write audit log:", e);
        // In a real app, you might want to send this error to a monitoring service.
    }
}
