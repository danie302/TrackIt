import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { CallbackError, Document, Types } from 'mongoose';
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
  name!: string;
  email!: string;
  username!: string;
  password!: string;
  cel!: string;
  dni!: string;
  typeOfDni!: DniType;
  role!: UserRole;
  companyId?: Types.ObjectId;
  isActive!: boolean;
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
(UserSchema as any).pre('save', async function (this: any, next: (err?: CallbackError) => void) {
  const user = this as any;
  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    return next(error as CallbackError);
  }
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ companyId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
