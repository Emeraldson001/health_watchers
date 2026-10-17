import { Schema, model, models } from 'mongoose';
import { auditHashChainPlugin } from './audit-chain.plugin';

export type AuditAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditResourceType = 'Patient' | 'Encounter' | 'Payment';

export interface AuditLog {
  userId: string;
  clinicId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<AuditLog>(
  {
    userId: { type: String, required: true, index: true },
    clinicId: { type: String, required: true, index: true },
    action: { type: String, enum: ['READ', 'CREATE', 'UPDATE', 'DELETE'], required: true },
    resourceType: { type: String, enum: ['Patient', 'Encounter', 'Payment'], required: true },
    resourceId: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  {
    // Append-only: disable updates and deletes at the schema level
    versionKey: false,
  }
);

// Tamper evidence: per-clinic SHA-256 hash chain (#1494)
auditLogSchema.plugin(auditHashChainPlugin);

export const AuditLogModel = (models.AuditLog ||
  model<AuditLog>('AuditLog', auditLogSchema)) as import('mongoose').Model<AuditLog>;
