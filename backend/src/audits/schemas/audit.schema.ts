import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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
  @Prop({ required: true, enum: EntityType })
  entityType!: EntityType;

  @Prop({ type: Types.ObjectId, required: true })
  entityId!: Types.ObjectId;

  @Prop({ required: true, enum: AuditAction })
  action!: AuditAction;

  @Prop({ type: Types.ObjectId, required: true })
  actor!: Types.ObjectId;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Types.ObjectId })
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
