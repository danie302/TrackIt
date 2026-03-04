import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  name!: string;
  logo?: string;
  nit!: string;
  users?: Types.ObjectId[];
  inventories?: Types.ObjectId[];
  createdAt!: Date;
  updatedAt!: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// Indexes
CompanySchema.index({ nit: 1 }, { unique: true });
CompanySchema.index({ createdAt: -1 });
