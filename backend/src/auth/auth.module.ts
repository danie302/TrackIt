import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';
import { PasswordValidator } from './validators/password.validator';
import { PasswordService } from './services/password.service';
import { OtpService } from './services/otp.service';
import { RateLimitService } from './services/rate-limit.service';
import { PasswordResetService } from './services/password-reset.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
    useFactory: (config: ConfigService) => {
      const secret =
        config.get<string>('JWT_ACCESS_SECRET') ??
        config.get<string>('JWT_SECRET');
      const expiresIn =
        config.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') ?? '15m';
      return {
        secret,
        signOptions: { expiresIn: expiresIn as '15m' },
      };
    },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    UsersModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    TokenService,
    PasswordValidator,
    PasswordService,
    OtpService,
    RateLimitService,
    PasswordResetService,
    AuthService,
    JwtAuthGuard,
  ],
  exports: [TokenService, JwtAuthGuard, PasswordService, PasswordValidator],
})
export class AuthModule {}
