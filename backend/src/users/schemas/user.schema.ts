import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  MASTER_ADMIN = 'MasterAdmin',
  COMPANY_ADMIN = 'CompanyAdmin',
  EMPLOYER = 'Employer',
  RESELLER = 'Reseller',
}

export enum DniType {
  CC = 'CC',
  TI = 'TI',
  CE = 'CE',
  PP = 'PP',
  NIT = 'NIT',
  PASSPORT = 'Passport',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  cel!: string;

  @Prop({ required: true })
  dni!: string;

  @Prop({ required: true, enum: DniType })
  typeOfDni!: DniType;

  @Prop({ required: true, enum: UserRole })
  role!: UserRole;

  @Prop({ type: Types.ObjectId })
  companyId?: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop({ type: [{ type: Types.ObjectId }] })
  inventories?: Types.ObjectId[];

  createdAt!: Date;
  updatedAt!: Date;

  // Instance method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, (this as any).password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook for password hashing
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ companyId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
