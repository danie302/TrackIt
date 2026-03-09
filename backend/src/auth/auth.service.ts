import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { UserRole, DniType } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { TokenService } from './services/token.service';
import { PasswordValidator } from './validators/password.validator';
import { PasswordResetService } from './services/password-reset.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private tokenService: TokenService,
    private passwordValidator: PasswordValidator,
    private passwordResetService: PasswordResetService,
  ) {}

  private toUserResponse(user: UserDocument): AuthResponseDto['user'] {
    return {
      _id: String(user._id),
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      companyId: user.companyId ? String(user.companyId) : undefined,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.passwordValidator.validate(dto.password);
    const email = dto.email.trim().toLowerCase();
    const existingEmail = await this.userModel.findOne({ email }).exec();
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }
    const existingUsername = await this.userModel
      .findOne({ username: dto.username })
      .exec();
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }
    const typeOfDni =
      Object.values(DniType).includes(dto.typeOfDni as DniType) ?
        (dto.typeOfDni as DniType)
      : DniType.CC;
    const role = Object.values(UserRole).includes(dto.role as UserRole) ?
      (dto.role as UserRole)
    : UserRole.RESELLER;
    const user = await this.userModel.create({
      name: dto.name,
      email,
      username: dto.username,
      password: dto.password,
      cel: dto.cel,
      dni: dto.dni,
      typeOfDni,
      role,
      companyId: dto.companyId || undefined,
      isActive: true,
    });
    const tokens = await this.tokenService.generateTokens(
      String(user._id),
      user.email,
    );
    return {
      ...tokens,
      user: this.toUserResponse(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = (await this.userModel.collection.findOne({ email })) as any;
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = await this.tokenService.generateTokens(
      String(user._id),
      user.email,
    );
    return {
      ...tokens,
      user: this.toUserResponse(user),
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.tokenService.revokeRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string): Promise<Omit<AuthResponseDto, 'user'>> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.tokenService.refreshTokens(refreshToken);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    await this.passwordResetService.requestPasswordReset(email);
    return {
      message:
        'If an account exists with this email, you will receive an OTP to reset your password.',
    };
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    await this.passwordResetService.resetPassword(email, otp, newPassword);
    return { message: 'Password has been reset successfully' };
  }

  async me(user: UserDocument): Promise<AuthResponseDto['user']> {
    return this.toUserResponse(user);
  }
}
