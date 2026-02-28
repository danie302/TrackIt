# Story 2.1-001: Configure Auth.js with NestJS

## Metadata
- **Category:** Authentication
- **Priority:** High
- **Estimated Effort:** 6 hours
- **Dependencies:** Story 1.2-001, Story 0.3-002
- **Assignee:** TBD
- **Status:** Not Started

## Description
Set up Auth.js integration with NestJS, implementing JWT-based authentication with access and refresh tokens. Configure Redis for refresh token storage with automatic expiration.

## Tasks
1. Install required packages: Auth.js, @nestjs/jwt, @nestjs/passport, passport-jwt
2. Create JWT configuration module with environment variables
3. Implement JWT strategy with token validation
4. Create token generation service (access: 15min, refresh: 7 days)
5. Implement refresh token storage in Redis with TTL
6. Create JwtAuthGuard for route protection
7. Implement token refresh logic with rotation
8. Create token blacklist mechanism in Redis for logout
9. Add JWT module to AppModule
10. Write unit tests for auth services

## Acceptance Criteria
- JWT tokens are generated with correct payload structure
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Refresh tokens stored in Redis with automatic TTL
- JwtAuthGuard validates tokens correctly
- Token refresh rotates both access and refresh tokens
- Expired tokens are rejected
- Invalid tokens return 401 Unauthorized

## Technical Notes

### Package Installation
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

### Environment Variables
```env
# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### JWT Strategy Implementation
```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
```

### Token Service
```typescript
// auth/services/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    
    // Store refresh token in Redis
    await this.redisService.set(
      `refresh_token:${userId}`,
      refreshToken,
      60 * 60 * 24 * 7, // 7 days in seconds
    );
    
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      
      const storedToken = await this.redisService.get(
        `refresh_token:${payload.sub}`,
      );
      
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Generate new tokens
      return this.generateTokens(payload.sub, payload.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeToken(userId: string) {
    await this.redisService.del(`refresh_token:${userId}`);
  }
}
```

### JWT Auth Guard
```typescript
// auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
```

### JWT Module Configuration
```typescript
// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, TokenService],
  exports: [TokenService],
})
export class AuthModule {}
```

## Testing Requirements
- Test token generation with valid user data
- Test access token expiration after 15 minutes
- Test refresh token expiration after 7 days
- Test refresh token stored in Redis correctly
- Test token refresh flow
- Test token revocation on logout
- Test JwtAuthGuard blocks requests without token
- Test JwtAuthGuard blocks requests with invalid token
- Test JwtAuthGuard allows requests with valid token

## Documentation Requirements
- Document JWT configuration in README
- Document token structure and payload
- Document token refresh flow
- Document token expiration times
- Add API examples with Authorization header

## Related Files
- `src/auth/auth.module.ts` (create)
- `src/auth/strategies/jwt.strategy.ts` (create)
- `src/auth/services/token.service.ts` (create)
- `src/auth/guards/jwt-auth.guard.ts` (create)
- `src/auth/interfaces/jwt-payload.interface.ts` (create)
- `.env` (update with JWT secrets)
- `src/app.module.ts` (import AuthModule)

## Notes
- Use strong, unique secrets for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
- Access token expiration should balance security and user experience
- Refresh tokens must be stored securely in Redis with automatic expiration
- Consider implementing token blacklist for compromised tokens
- Token rotation on refresh prevents token reuse attacks
- Keep JWT payload minimal to reduce token size
