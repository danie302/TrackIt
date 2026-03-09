import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop()
  logo?: string;

  @Prop({ required: true })
  nit!: string;

  @Prop({ type: [{ type: Types.ObjectId }] })
  users?: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }] })
  inventories?: Types.ObjectId[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// Indexes
CompanySchema.index({ nit: 1 }, { unique: true });
CompanySchema.index({ createdAt: -1 });
