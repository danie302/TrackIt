import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { UserRole, DniType } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  cel: string;

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsEnum(DniType)
  @IsNotEmpty()
  typeOfDni: DniType;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsOptional()
  @IsMongoId()
  companyId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  cel?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsEnum(DniType)
  typeOfDni?: DniType;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsMongoId()
  companyId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UserResponseDto {
  _id!: string;
  name!: string;
  email!: string;
  username!: string;
  cel!: string;
  dni!: string;
  typeOfDni!: DniType;
  role!: UserRole;
  companyId?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character',
  })
  newPassword: string;
}
