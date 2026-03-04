import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
  name!: string;
  companyId!: Types.ObjectId;
  resellerId?: Types.ObjectId;
  isResellerInventory!: boolean;
  categories!: Types.ObjectId[];
  whitelist!: Types.ObjectId[];
  items?: Types.ObjectId[];
  createdAt!: Date;
  updatedAt!: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Virtual for whitelist user details - populated when needed
InventorySchema.virtual('whitelistDetails', {
  ref: 'User',
  localField: 'whitelist',
  foreignField: '_id',
  justOne: false,
});

// Pre-save hook for validation
// @ts-ignore - mongoose type definitions issue with next() return
InventorySchema.pre('save', function (next) {
  const inv = this as any;
  if (inv.isResellerInventory && !inv.resellerId) {
    return next(new Error('resellerId is required when isResellerInventory is true'));
    return;
  }
  next();
});

// Indexes
InventorySchema.index({ companyId: 1 });
InventorySchema.index({ resellerId: 1 });
InventorySchema.index({ isResellerInventory: 1 });
InventorySchema.index({ companyId: 1, isResellerInventory: 1 });
InventorySchema.index({ createdAt: -1 });
