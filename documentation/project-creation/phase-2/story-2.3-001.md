# Story 2.3-001: Authentication Endpoints

## Metadata
- **Category:** API Development
- **Priority:** High
- **Estimated Effort:** 5 hours
- **Dependencies:** Story 2.1-001, Story 2.2-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement all authentication endpoints including registration, login, logout, token refresh, password reset, and user profile retrieval with proper validation and error handling.

## Tasks
1. Create DTOs for all auth endpoints with validation
2. Implement POST /api/v1/auth/register endpoint
3. Implement POST /api/v1/auth/login endpoint
4. Implement POST /api/v1/auth/logout endpoint
5. Implement POST /api/v1/auth/refresh endpoint
6. Implement POST /api/v1/auth/forgot-password endpoint
7. Implement POST /api/v1/auth/reset-password endpoint
8. Implement GET /api/v1/auth/me endpoint
9. Add proper error handling and status codes
10. Write integration tests for all endpoints
11. Document all endpoints with Swagger/OpenAPI

## Acceptance Criteria
- All endpoints return correct HTTP status codes
- Request validation rejects invalid data
- Login returns both access and refresh tokens
- Refresh endpoint rotates tokens correctly
- Logout invalidates refresh token
- Password reset flow works end-to-end
- /me endpoint returns current user data
- All endpoints have proper error messages
- Swagger documentation is complete

## Technical Notes

### DTOs with Validation
```typescript
// auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../users/enums/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'CompanyAdmin', enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  companyId: string;
}

// auth/dto/login.dto.ts
export class LoginDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;
}

// auth/dto/refresh-token.dto.ts
export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

// auth/dto/forgot-password.dto.ts
export class ForgotPasswordDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;
}

// auth/dto/reset-password.dto.ts
export class ResetPasswordDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  otp: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
```

### Auth Controller
```typescript
// auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(forgotPasswordDto.email);
    return { message: 'If the email exists, an OTP has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.otp,
      resetPasswordDto.newPassword,
    );
    return { message: 'Password reset successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getUserProfile(user.id);
  }
}
```

### Auth Service
```typescript
// auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { PasswordResetService } from './services/password-reset.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private passwordService: PasswordService,
    private passwordResetService: PasswordResetService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordService.hash(registerDto.password);
    
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const tokens = await this.tokenService.generateTokens(user.id, user.email);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const tokens = await this.tokenService.generateTokens(user.id, user.email);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.tokenService.revokeToken(userId);
  }

  async refreshTokens(refreshToken: string) {
    return this.tokenService.refreshTokens(refreshToken);
  }

  async requestPasswordReset(email: string) {
    await this.passwordResetService.requestPasswordReset(email);
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    await this.passwordResetService.resetPassword(email, otp, newPassword);
  }

  async getUserProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
    };
  }
}
```

### CurrentUser Decorator
```typescript
// auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## Testing Requirements
- Test successful registration creates user and returns tokens
- Test registration with existing email returns 409
- Test successful login returns tokens
- Test login with invalid credentials returns 401
- Test login with inactive user returns 401
- Test logout invalidates refresh token
- Test refresh endpoint rotates tokens
- Test refresh with invalid token returns 401
- Test forgot password sends OTP
- Test reset password with valid OTP succeeds
- Test reset password with invalid OTP fails
- Test /me endpoint returns user data
- Test /me endpoint without token returns 401

## Documentation Requirements
- Add Swagger/OpenAPI documentation for all endpoints
- Document request/response schemas
- Document error responses
- Add authentication flow diagram
- Create API usage examples

## Related Files
- `src/auth/auth.controller.ts` (create)
- `src/auth/auth.service.ts` (create)
- `src/auth/dto/*.dto.ts` (create)
- `src/auth/decorators/current-user.decorator.ts` (create)
- `src/main.ts` (configure Swagger)

## Notes
- Use class-validator for DTO validation
- Return same response for existing/non-existing email in forgot-password
- Never expose whether user exists in error messages
- Include rate limiting headers in responses
- Consider implementing account lockout after failed login attempts
- Tokens should be returned in response body, not cookies for SPA
