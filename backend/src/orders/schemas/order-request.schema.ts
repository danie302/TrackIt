import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderType {
  STANDARD = 'Standard',
  DEVOLUTION = 'Devolution',
}

export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export type OrderRequestDocument = OrderRequest & Document;

@Schema({ timestamps: true })
export class OrderRequest {
  orderType!: OrderType;
  status!: OrderStatus;
  creator!: Types.ObjectId;
  companyId!: Types.ObjectId;
  sourceInventoryId!: Types.ObjectId;
  targetInventoryId!: Types.ObjectId;
  rejectionReason?: string;
  devolutionReason?: string;
  items!: Types.ObjectId[];
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  // Instance method to check if order can be approved
  canApprove(): boolean {
    return this.status === OrderStatus.PENDING;
  }

  // Instance method to check if order can be rejected
  canReject(): boolean {
    return this.status === OrderStatus.PENDING;
  }

  // Instance method to check if order is expired (30 days old)
  isExpired(): boolean {
    if (this.status !== OrderStatus.PENDING) {
      return false;
    }
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt < thirtyDaysAgo;
  }
}

export const OrderRequestSchema = SchemaFactory.createForClass(OrderRequest);

// Indexes
OrderRequestSchema.index({ companyId: 1 });
OrderRequestSchema.index({ creator: 1 });
OrderRequestSchema.index({ status: 1 });
OrderRequestSchema.index({ sourceInventoryId: 1 });
OrderRequestSchema.index({ targetInventoryId: 1 });
OrderRequestSchema.index({ createdAt: -1 });
OrderRequestSchema.index({ companyId: 1, status: 1 });
OrderRequestSchema.index({ creator: 1, status: 1 });
