import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: Types.ObjectId, required: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  resellerId?: Types.ObjectId;

  @Prop({ required: true, default: false })
  isResellerInventory!: boolean;

  @Prop({ type: [{ type: Types.ObjectId }], default: [] })
  categories!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }], default: [] })
  whitelist!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }] })
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
InventorySchema.pre('save', function (this: any) {
  if (this.isResellerInventory && !this.resellerId) {
    throw new Error('resellerId is required when isResellerInventory is true');
  }
});

// Indexes
InventorySchema.index({ companyId: 1 });
InventorySchema.index({ resellerId: 1 });
InventorySchema.index({ isResellerInventory: 1 });
InventorySchema.index({ companyId: 1, isResellerInventory: 1 });
InventorySchema.index({ createdAt: -1 });
