# Story 0.4-001: Create Environment Configuration Files

## Metadata
- **Category:** Infrastructure
- **Priority:** High
- **Estimated Effort:** 2 hours
- **Dependencies:** Story 0.1-001, Story 0.1-002
- **Assignee:** TBD
- **Status:** Not Started

## Description
Set up environment configuration for both frontend and backend with validation and example files for all required variables.

## Tasks
1. Create `frontend/.env.example` with all required variables
2. Create `backend/.env.example` with all required variables
3. Install and configure `@nestjs/config` in backend
4. Create environment validation schema using class-validator
5. Document all environment variables with descriptions
6. Add environment loading in backend startup with validation
7. Configure Vite to load environment variables in frontend

## Acceptance Criteria
- `.env.example` files list all required variables with descriptions
- Backend validates environment variables on startup
- Missing required variables cause startup failure with clear error message
- Environment variables are type-safe in backend
- Vite loads environment variables with VITE_ prefix correctly

## Technical Notes

### Frontend .env.example
```bash
# API Configuration
VITE_API_URL=http://localhost:3000

# Application Configuration
VITE_APP_NAME=Track It
VITE_APP_VERSION=1.0.0
```

### Backend .env.example
```bash
# Application
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/trackit
MONGODB_TEST_URI=mongodb://localhost:27017/trackit_test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@trackit.com
SMTP_FROM_NAME=Track It System

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# AWS S3 (Production)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1
```

### Environment Validation (NestJS)
```typescript
// src/config/env.validation.ts
import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  JWT_SECRET: string;

  // ... other validations
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
```

## Testing Requirements
- Test backend starts with valid environment
- Test backend fails with missing required variables
- Test backend fails with invalid variable types
- Test frontend loads VITE_ prefixed variables

## Documentation Requirements
- Document each environment variable's purpose
- Add examples of valid values
- Document which variables are required vs optional
- Add environment setup guide to README files

## Related Files
- `frontend/.env.example` (create)
- `backend/.env.example` (create)
- `backend/src/config/env.validation.ts` (create)
- `backend/src/app.module.ts` (modify to add ConfigModule)
- `frontend/README.md` (update)
- `backend/README.md` (update)

## Notes
- Never commit actual `.env` files to git (already in .gitignore)
- `.env.example` files ARE committed as templates
- Backend uses @nestjs/config with validation
- Frontend uses Vite's built-in env support (VITE_ prefix required)
- Generate strong secrets for JWT in production
- Use different secrets for development, staging, and production
