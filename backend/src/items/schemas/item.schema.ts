import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  brand!: string;

  @Prop({ required: true })
  serial!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  retailPrice!: number;

  @Prop({ type: Types.ObjectId, required: true })
  inventoryId!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId }], default: [] })
  categories!: Types.ObjectId[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

// Pre-save hook for serial uniqueness and price validation
ItemSchema.pre('save', async function (this: any) {
  if (this.price !== undefined && this.price < 0) {
    throw new Error('Price must be a positive number');
  }
  if (this.retailPrice !== undefined && this.retailPrice < 0) {
    throw new Error('Retail price must be a positive number');
  }

  if (this.isNew || this.isModified('serial')) {
    const existingItem = await (this.constructor as any).findOne({
      serial: this.serial,
      _id: { $ne: this._id },
    });
    if (existingItem) {
      throw new Error(`Item with serial number '${this.serial}' already exists`);
    }
  }
});

// Indexes
ItemSchema.index({ serial: 1 }, { unique: true });
ItemSchema.index({ inventoryId: 1 });
ItemSchema.index({ categories: 1 });
ItemSchema.index({ brand: 1 });
ItemSchema.index({ createdAt: -1 });
