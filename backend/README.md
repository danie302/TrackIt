# TrackIt Backend

NestJS + MongoDB + Redis backend API for the TrackIt inventory management system.

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript (Strict Mode)
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: Auth.js / bcrypt
- **Email**: Nodemailer
- **Validation**: class-validator, class-transformer

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- Redis instance

### Installation

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

The development server will start on `http://localhost:3000`

## Project Structure

```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── companies/      # Company management
├── inventories/    # Inventory management
├── items/          # Item management
├── orders/         # Order request management
├── audits/         # Audit trail system
├── categories/     # Category management
├── config/         # Configuration module
├── app.module.ts   # Root module
└── main.ts         # Application entry point
```

## Module Structure

Each module follows NestJS conventions:

```
module-name/
├── dto/                    # Data Transfer Objects
├── schemas/                # Mongoose schemas
├── module-name.module.ts   # Module definition
├── module-name.controller.ts # REST endpoints
├── module-name.service.ts    # Business logic
└── module-name.spec.ts       # Unit tests
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/trackit

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@trackit.com
```

## Available Scripts

- `npm run start` - Start server
- `npm run start:dev` - Start with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start production server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Generate test coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

Once the server is running, Swagger documentation will be available at:
`http://localhost:3000/api/docs` (to be configured)

## Development Guidelines

### Module Generation

Use NestJS CLI to generate modules, controllers, and services:

```bash
nest g module feature-name
nest g controller feature-name --no-spec
nest g service feature-name --no-spec
```

### Code Style

- Use TypeScript strict mode
- Follow NestJS naming conventions
- Use dependency injection
- Implement proper error handling
- Write unit tests for services

### Database

- Use Mongoose for MongoDB ODM
- Define schemas in `schemas/` folder
- Use DTOs for validation
- Implement indexes for performance

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## TypeScript Configuration

The project uses strict TypeScript mode:
- `strict: true`
- `noImplicitAny: true`
- `strictBindCallApply: true`
- `noFallthroughCasesInSwitch: true`

## Next Steps

1. Set up MongoDB connection
2. Set up Redis connection
3. Configure environment variables
4. Create database schemas
5. Implement authentication
6. Build API endpoints

## Related Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
