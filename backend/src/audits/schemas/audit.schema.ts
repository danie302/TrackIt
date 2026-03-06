import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EntityType {
  COMPANY = 'Company',
  USER = 'User',
  CATEGORY = 'Category',
  INVENTORY = 'Inventory',
  ITEM = 'Item',
  ORDER_REQUEST = 'OrderRequest',
  AUDIT = 'Audit',
}

export enum AuditAction {
  CREATE = 'Create',
  UPDATE = 'Update',
  DELETE = 'Delete',
  DEACTIVATE = 'Deactivate',
  APPROVE = 'Approve',
  REJECT = 'Reject',
  MOVE = 'Move',
}

export type AuditDocument = Audit & Document;

@Schema({ timestamps: true })
export class Audit {
  entityType!: EntityType;
  entityId!: Types.ObjectId;
  action!: AuditAction;
  actor!: Types.ObjectId;
  description!: string;
  metadata?: Record<string, any>;
  companyId?: Types.ObjectId;
  createdAt!: Date;
  updatedAt!: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

// Indexes for efficient audit queries
AuditSchema.index({ entityType: 1 });
AuditSchema.index({ entityId: 1 });
AuditSchema.index({ actor: 1 });
AuditSchema.index({ createdAt: -1 });
AuditSchema.index({ entityId: 1, createdAt: -1 });
AuditSchema.index({ actor: 1, createdAt: -1 });
AuditSchema.index({ companyId: 1, createdAt: -1 });
