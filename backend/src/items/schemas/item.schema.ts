import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { CallbackError, Document, Types } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  name!: string;
  brand!: string;
  serial!: string;
  price!: number;
  retailPrice!: number;
  inventoryId!: Types.ObjectId;
  categories!: Types.ObjectId[];
  createdAt!: Date;
  updatedAt!: Date;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

// Pre-save hook for serial uniqueness and price validation
(ItemSchema as any).pre('save', async function (this: any, next: (err?: CallbackError) => void) {
  const item = this as any;

  // Validate prices are positive
  if (item.price !== undefined && item.price < 0) {
    return next(new Error('Price must be a positive number'));
  }
  if (item.retailPrice !== undefined && item.retailPrice < 0) {
    return next(new Error('Retail price must be a positive number'));
  }

  // Validate serial number uniqueness before saving
  if (item.isNew || item.isModified('serial')) {
    try {
      const existingItem = await (this.constructor as any).findOne({
        serial: item.serial,
        _id: { $ne: item._id },
      });

      if (existingItem) {
        return next(new Error(`Item with serial number '${item.serial}' already exists`));
      }
    } catch (error) {
      return next(error as CallbackError);
    }
  }

  next();
});

// Indexes
ItemSchema.index({ serial: 1 }, { unique: true });
ItemSchema.index({ inventoryId: 1 });
ItemSchema.index({ categories: 1 });
ItemSchema.index({ brand: 1 });
ItemSchema.index({ createdAt: -1 });
