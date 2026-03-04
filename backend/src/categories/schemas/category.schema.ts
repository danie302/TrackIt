import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  name!: string;
  companyId!: Types.ObjectId;
  items?: Types.ObjectId[];
  createdAt!: Date;
  updatedAt!: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes - compound index on companyId + name to ensure unique names per company
CategorySchema.index({ companyId: 1, name: 1 }, { unique: true });
CategorySchema.index({ companyId: 1 });
CategorySchema.index({ createdAt: -1 });
