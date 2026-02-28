# Story 0.1-002: Initialize Backend with NestJS

## Metadata
- **Category:** Infrastructure
- **Priority:** Critical
- **Estimated Effort:** 2 hours
- **Dependencies:** None
- **Assignee:** TBD
- **Status:** Not Started

## Description
Set up the backend application using NestJS with TypeScript and create base module structure.

## Tasks
1. Run `npm install -g @nestjs/cli`
2. Run `nest new backend` (select npm as package manager)
3. Install core dependencies:
   - `npm install @nestjs/mongoose mongoose`
   - `npm install @nestjs/cache-manager cache-manager cache-manager-redis-store`
   - `npm install nodemailer @nestjs/mailer`
   - `npm install bcrypt class-validator class-transformer`
   - `npm install @types/bcrypt @types/nodemailer -D`
4. Configure `tsconfig.json` with strict mode
5. Create base module structure using NestJS CLI:
   - `nest g module auth`
   - `nest g module users`
   - `nest g module companies`
   - `nest g module inventories`
   - `nest g module items`
   - `nest g module orders`
   - `nest g module audits`
   - `nest g module categories`
6. Set up environment configuration module:
   - `npm install @nestjs/config`
   - `nest g module config`
7. Create `.gitignore` for backend

## Acceptance Criteria
- Backend app runs with `npm run start:dev`
- TypeScript compiles without errors
- Base modules are scaffolded and registered
- Hot reload works properly
- Environment configuration is ready

## Technical Notes
- NestJS uses decorators extensively, ensure TypeScript decorators are enabled
- Use NestJS CLI to generate modules, controllers, and services for consistency
- Configure strict mode in TypeScript for better type safety

### Module Structure
Each module should follow NestJS conventions:
```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts (to be added)
│   └── auth.service.ts (to be added)
├── users/
│   ├── users.module.ts
│   ├── schemas/
│   ├── dto/
│   └── ...
```

## Testing Requirements
- Unit tests: Verify modules are properly configured
- Integration tests: Test app starts and modules load

## Documentation Requirements
- Create `backend/README.md` with setup instructions
- Document module structure and naming conventions

## Related Files
- `backend/package.json` - Dependencies
- `backend/tsconfig.json` - TypeScript configuration
- `backend/nest-cli.json` - NestJS CLI configuration
- `backend/src/app.module.ts` - Root module
- `backend/src/main.ts` - Application entry point
- `backend/.gitignore` - Git ignore rules

## Notes
- Default port is 3000 (NestJS default)
- Hot reload is enabled by default with `npm run start:dev`
- Consider adding Swagger for API documentation later
