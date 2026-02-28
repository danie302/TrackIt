# Track It — Project Creation Plan

## Document Purpose

This document provides a comprehensive, story-level breakdown of the Track It project implementation. Each phase from the macro plan is decomposed into actionable user stories and technical tasks that can be assigned, estimated, and tracked.

**Reference:** See `documentation/MACRO-IMPLEMENTATION-PLAN.md` for the high-level overview.

---

## Project Structure

The project is organized into **20 phases**, each containing multiple stories. Stories are further broken down into tasks with clear acceptance criteria.

### Story Naming Convention
- **Format:** `PHASE-STORY-NUMBER: Brief Description`
- **Example:** `0.1-001: Initialize Frontend with Vite and React`

### Story Categories
- **Infrastructure:** Project setup, DevOps, containers
- **Backend:** API, services, database, authentication
- **Frontend:** UI components, screens, state management
- **Testing:** Unit, integration, E2E tests
- **Documentation:** API docs, guides, README files

---

## Phase 0: Project Foundation & Infrastructure

### Story 0.1-001: Initialize Frontend with Vite and React
**Category:** Infrastructure  
**Priority:** Critical  
**Estimated Effort:** 2 hours  
**Dependencies:** None

**Description:**
Set up the frontend application using Vite, React, and TypeScript with proper project structure.

**Tasks:**
1. Run `npm create vite@latest frontend -- --template react-ts`
2. Install Material UI: `npm install @mui/material @emotion/react @emotion/styled`
3. Install additional dependencies: React Router, Zustand, Axios, React Hook Form
4. Configure `tsconfig.json` with strict mode and path aliases
5. Create base folder structure: `src/components`, `src/pages`, `src/services`, `src/stores`, `src/types`, `src/utils`
6. Set up absolute imports with `@/` prefix
7. Create `.gitignore` for frontend

**Acceptance Criteria:**
- Frontend app runs with `npm run dev`
- TypeScript compiles without errors
- Material UI is importable
- Folder structure is in place

**Documentation:** `documentation/project-creation/phase-0/story-0.1-001.md`

---

### Story 0.1-002: Initialize Backend with NestJS
**Category:** Infrastructure  
**Priority:** Critical  
**Estimated Effort:** 2 hours  
**Dependencies:** None

**Description:**
Set up the backend application using NestJS with TypeScript.

**Tasks:**
1. Run `npm install -g @nestjs/cli`
2. Run `nest new backend`
3. Install dependencies: Mongoose, Redis client, Nodemailer, bcrypt, class-validator
4. Configure `tsconfig.json` with strict mode
5. Create base module structure: auth, users, companies, inventories, items, orders, audits
6. Set up environment configuration module
7. Create `.gitignore` for backend

**Acceptance Criteria:**
- Backend app runs with `npm run start:dev`
- TypeScript compiles without errors
- Base modules are scaffolded
- Hot reload works

**Documentation:** `documentation/project-creation/phase-0/story-0.1-002.md`

---

### Story 0.2-001: Create Docker Configuration for Development
**Category:** Infrastructure  
**Priority:** Critical  
**Estimated Effort:** 4 hours  
**Dependencies:** Story 0.1-001, Story 0.1-002

**Description:**
Create Docker configuration for all services in development mode with hot reload support.

**Tasks:**
1. Create `frontend/Dockerfile.dev` with Node base image and volume mounting
2. Create `backend/Dockerfile.dev` with Node base image and volume mounting
3. Create `docker-compose.yml` with services: frontend, backend, mongodb, redis
4. Configure MongoDB with initialization scripts
5. Configure Redis with persistence
6. Set up networking between containers
7. Create `.dockerignore` files for frontend and backend
8. Create `docker/README.md` with usage instructions

**Acceptance Criteria:**
- `docker-compose up` starts all services successfully
- Hot reload works for both frontend and backend
- MongoDB is accessible at localhost:27017
- Redis is accessible at localhost:6379
- Services can communicate with each other

**Documentation:** `documentation/project-creation/phase-0/story-0.2-001.md`

---

### Story 0.3-001: Set Up MongoDB Connection and Mongoose Configuration
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 3 hours  
**Dependencies:** Story 0.1-002, Story 0.2-001

**Description:**
Configure MongoDB connection in the NestJS backend using Mongoose.

**Tasks:**
1. Install `@nestjs/mongoose` and `mongoose`
2. Create database configuration module
3. Configure MongooseModule in `app.module.ts`
4. Set up connection string from environment variables
5. Add connection error handling
6. Create database health check service
7. Test connection with basic query

**Acceptance Criteria:**
- Backend connects to MongoDB successfully
- Connection errors are logged properly
- Health check endpoint returns database status
- Connection pool is configured

**Documentation:** `documentation/project-creation/phase-0/story-0.3-001.md`

---

### Story 0.3-002: Set Up Redis Connection
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 2 hours  
**Dependencies:** Story 0.1-002, Story 0.2-001

**Description:**
Configure Redis connection in the NestJS backend for caching and session management.

**Tasks:**
1. Install `@nestjs/cache-manager` and `cache-manager-redis-store`
2. Create Redis configuration module
3. Configure CacheModule in `app.module.ts`
4. Set up Redis connection from environment variables
5. Add connection error handling
6. Create Redis health check
7. Test basic set/get operations

**Acceptance Criteria:**
- Backend connects to Redis successfully
- Can store and retrieve cached values
- Connection errors are handled gracefully
- Health check includes Redis status

**Documentation:** `documentation/project-creation/phase-0/story-0.3-002.md`

---

### Story 0.4-001: Create Environment Configuration Files
**Category:** Infrastructure  
**Priority:** High  
**Estimated Effort:** 2 hours  
**Dependencies:** Story 0.1-001, Story 0.1-002

**Description:**
Set up environment configuration for both frontend and backend with example files.

**Tasks:**
1. Create `frontend/.env.example` with all required variables
2. Create `backend/.env.example` with all required variables
3. Install and configure `@nestjs/config` in backend
4. Create environment validation schema in backend
5. Document all environment variables
6. Add environment loading in backend startup
7. Configure Vite to load environment variables in frontend

**Acceptance Criteria:**
- `.env.example` files list all required variables
- Backend validates environment variables on startup
- Missing required variables cause startup failure with clear error
- Environment variables are type-safe

**Documentation:** `documentation/project-creation/phase-0/story-0.4-001.md`

---

### Story 0.5-001: Create Database Seed Scripts
**Category:** Infrastructure  
**Priority:** Medium  
**Estimated Effort:** 4 hours  
**Dependencies:** Story 0.3-001

**Description:**
Create seed scripts to populate the database with initial test data.

**Tasks:**
1. Create `docker/seed/` directory structure
2. Create seed script for Master Admin user
3. Create seed script for test companies
4. Create seed script for test users (all roles)
5. Create seed script for test inventories and items
6. Create master seed script that runs all seeds in order
7. Create cleanup script to reset database
8. Document seed data in README

**Acceptance Criteria:**
- Seed script creates Master Admin user successfully
- Seed script creates 2-3 test companies with users
- Seed script creates sample inventories with items
- Cleanup script removes all seed data
- Seed scripts are idempotent (can run multiple times)

**Documentation:** `documentation/project-creation/phase-0/story-0.5-001.md`

---

## Phase 1: Core Backend — Data Models & Database Layer

### Story 1.1-001: Implement Company Mongoose Schema
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 2 hours  
**Dependencies:** Story 0.3-001

**Description:**
Create the Company model with Mongoose schema, validation, and indexes.

**Tasks:**
1. Create `src/companies/schemas/company.schema.ts`
2. Define schema with fields: name, logo, nit, createdAt, updatedAt
3. Add validation: required fields, unique NIT
4. Create indexes: NIT (unique)
5. Add timestamps plugin
6. Create TypeScript interface for Company
7. Export schema and model

**Acceptance Criteria:**
- Schema compiles without errors
- NIT uniqueness is enforced
- Timestamps are auto-generated
- Indexes are created on database

**Documentation:** `documentation/project-creation/phase-1/story-1.1-001.md`

---

### Story 1.2-001: Implement User Mongoose Schema
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 3 hours  
**Dependencies:** Story 0.3-001, Story 1.1-001

**Description:**
Create the User model with authentication fields, role management, and proper validation.

**Tasks:**
1. Create `src/users/schemas/user.schema.ts`
2. Define schema with all required fields
3. Create Role enum: MasterAdmin, CompanyAdmin, Employer, Reseller
4. Add validation: unique email/username, role enum, password requirements
5. Create indexes: email (unique), username (unique), companyId
6. Add pre-save hook for password hashing
7. Add method to compare passwords
8. Create TypeScript interfaces

**Acceptance Criteria:**
- Schema enforces email and username uniqueness
- Passwords are hashed before saving
- Role enum validates allowed values
- Password comparison method works correctly

**Documentation:** `documentation/project-creation/phase-1/story-1.2-001.md`

---

### Story 1.3-001: Implement Category Mongoose Schema
**Category:** Backend  
**Priority:** High  
**Estimated Effort:** 2 hours  
**Dependencies:** Story 0.3-001, Story 1.1-001

**Description:**
Create the Category model for organizing inventory items.

**Tasks:**
1. Create `src/categories/schemas/category.schema.ts`
2. Define schema: name, companyId, createdAt, updatedAt
3. Add validation: required fields
4. Create compound index: (companyId + name) unique
5. Add reference to Company model
6. Create TypeScript interfaces

**Acceptance Criteria:**
- Schema enforces unique category names per company
- Company reference works correctly
- Indexes are created

**Documentation:** `documentation/project-creation/phase-1/story-1.3-001.md`

---

### Story 1.4-001: Implement Inventory Mongoose Schema
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 3 hours  
**Dependencies:** Story 1.1-001, Story 1.2-001, Story 1.3-001

**Description:**
Create the Inventory model with support for company and reseller inventories.

**Tasks:**
1. Create `src/inventories/schemas/inventory.schema.ts`
2. Define schema: name, companyId, resellerId, isResellerInventory, categories, whitelist, timestamps
3. Add validation: resellerId required if isResellerInventory is true
4. Create indexes: companyId, resellerId, isResellerInventory
5. Add references to Company, User (reseller), and Category models
6. Create virtual for whitelist user details
7. Create TypeScript interfaces

**Acceptance Criteria:**
- Schema validates reseller inventory rules
- Whitelist stores array of user IDs
- References populate correctly
- Indexes are created

**Documentation:** `documentation/project-creation/phase-1/story-1.4-001.md`

---

### Story 1.5-001: Implement Item Mongoose Schema
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 3 hours  
**Dependencies:** Story 1.3-001, Story 1.4-001

**Description:**
Create the Item model with global serial number uniqueness.

**Tasks:**
1. Create `src/items/schemas/item.schema.ts`
2. Define schema: name, brand, serial, price, retailPrice, inventoryId, categories, timestamps
3. Add validation: unique serial (globally), required fields, price validation
4. Create indexes: serial (unique), inventoryId, categories
5. Add reference to Inventory model
6. Add pre-save hook to validate serial uniqueness
7. Create TypeScript interfaces

**Acceptance Criteria:**
- Serial number uniqueness is enforced globally
- Prices are validated as positive numbers
- Inventory reference works correctly
- Categories array can store multiple category IDs

**Documentation:** `documentation/project-creation/phase-1/story-1.5-001.md`

---

### Story 1.6-001: Implement OrderRequest Mongoose Schema
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 4 hours  
**Dependencies:** Story 1.2-001, Story 1.4-001, Story 1.5-001

**Description:**
Create the OrderRequest model supporting both standard and devolution orders.

**Tasks:**
1. Create `src/orders/schemas/order-request.schema.ts`
2. Define schema with all fields including orderType, status, source/target inventories
3. Create enums: OrderType (Standard, Devolution), OrderStatus (Pending, Approved, Rejected)
4. Add validation: status transitions, required fields per order type
5. Create indexes: companyId, creator, status, sourceInventoryId, targetInventoryId, createdAt
6. Add references to User, Company, Inventory models
7. Add methods: canApprove(), canReject(), isExpired()
8. Create TypeScript interfaces

**Acceptance Criteria:**
- OrderType enum distinguishes standard vs devolution orders
- Status enum enforces valid order states
- References populate correctly
- Items array stores item IDs

**Documentation:** `documentation/project-creation/phase-1/story-1.6-001.md`

---

### Story 1.7-001: Implement Audit Mongoose Schema
**Category:** Backend  
**Priority:** High  
**Estimated Effort:** 3 hours  
**Dependencies:** Story 1.2-001

**Description:**
Create the Audit model for comprehensive activity logging.

**Tasks:**
1. Create `src/audits/schemas/audit.schema.ts`
2. Define schema: entityType, entityId, action, actor, description, metadata, timestamps
3. Create enums: EntityType, AuditAction (Create, Update, Delete, Deactivate, Approve, Reject, Move)
4. Add validation: required fields, enum values
5. Create indexes: entityType, entityId, actor, createdAt (for efficient querying)
6. Add reference to User (actor) model
7. Add metadata as flexible JSON field
8. Create TypeScript interfaces

**Acceptance Criteria:**
- Schema supports all entity types
- All audit actions are represented in enum
- Metadata field accepts any JSON structure
- Indexes optimize audit queries
- Actor reference works correctly

**Documentation:** `documentation/project-creation/phase-1/story-1.7-001.md`

---

## Phase 2: Core Backend — Authentication & Authorization

### Story 2.1-001: Configure Auth.js with NestJS
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 6 hours  
**Dependencies:** Story 1.2-001, Story 0.3-002

**Description:**
Integrate Auth.js with NestJS for JWT-based authentication with Redis session storage.

**Tasks:**
1. Install Auth.js and JWT dependencies
2. Create `src/auth/auth.module.ts` and related files
3. Configure JWT strategy with secret from environment
4. Set up token generation (access token 15min, refresh token 7 days)
5. Configure Redis for refresh token storage
6. Create JWT auth guard
7. Create token refresh endpoint logic
8. Add token validation middleware

**Acceptance Criteria:**
- JWT tokens are generated correctly
- Access tokens expire after 15 minutes
- Refresh tokens are stored in Redis
- Token validation works in guards

**Documentation:** `documentation/project-creation/phase-2/story-2.1-001.md`

---

### Story 2.2-001: Implement Password Management System
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 4 hours  
**Dependencies:** Story 1.2-001, Story 0.3-002

**Description:**
Implement secure password hashing, validation, and reset with OTP.

**Tasks:**
1. Create password validation service with complexity rules
2. Implement bcrypt hashing in User model pre-save hook
3. Create password comparison method
4. Create OTP generation service (6-digit random)
5. Store OTPs in Redis with 15-minute TTL
6. Create OTP verification service
7. Create password reset service
8. Add rate limiting for password reset requests

**Acceptance Criteria:**
- Passwords meet complexity requirements (8+ chars, upper, lower, number, special)
- Passwords are hashed with bcrypt (10 rounds)
- OTPs expire after 15 minutes
- OTPs are single-use only
- Password reset flow works end-to-end

**Documentation:** `documentation/project-creation/phase-2/story-2.2-001.md`

---

### Story 2.3-001: Implement Authentication Endpoints
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 5 hours  
**Dependencies:** Story 2.1-001, Story 2.2-001

**Description:**
Create all authentication-related API endpoints.

**Tasks:**
1. Create POST /api/v1/auth/register endpoint with validation
2. Create POST /api/v1/auth/login endpoint
3. Create POST /api/v1/auth/logout endpoint (invalidate refresh token)
4. Create POST /api/v1/auth/refresh endpoint
5. Create POST /api/v1/auth/forgot-password endpoint (generate OTP)
6. Create POST /api/v1/auth/reset-password endpoint (verify OTP)
7. Create GET /api/v1/auth/me endpoint (get current user)
8. Add request validation DTOs for all endpoints
9. Add response DTOs for all endpoints
10. Implement proper error handling

**Acceptance Criteria:**
- All endpoints return correct status codes
- Request bodies are validated
- Errors return consistent format
- Login returns access and refresh tokens
- Refresh endpoint validates and rotates tokens
- OTP flow works correctly

**Documentation:** `documentation/project-creation/phase-2/story-2.3-001.md`

---

### Story 2.4-001: Implement Authorization Guards and Decorators
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 5 hours  
**Dependencies:** Story 2.1-001, Story 1.2-001

**Description:**
Create role-based access control system with guards and decorators.

**Tasks:**
1. Create RoleGuard for role-based authorization
2. Create OwnershipGuard for resource ownership validation
3. Create CompanyGuard for company-scoped access
4. Create @Roles() decorator
5. Create @RequirePermissions() decorator
6. Create @CurrentUser() decorator for extracting user from request
7. Implement permission checking logic
8. Add guard composition for complex scenarios
9. Create guard unit tests

**Acceptance Criteria:**
- RoleGuard blocks users without required roles
- OwnershipGuard validates resource ownership
- CompanyGuard enforces company data isolation
- Decorators work correctly on controller methods
- Guards can be combined for complex authorization

**Documentation:** `documentation/project-creation/phase-2/story-2.4-001.md`

---

### Story 2.5-001: Define Permission System and Role Matrix
**Category:** Backend  
**Priority:** High  
**Estimated Effort:** 3 hours  
**Dependencies:** Story 2.4-001

**Description:**
Create comprehensive permission definitions for all roles.

**Tasks:**
1. Create permission constants file
2. Define Master Admin permissions (full system access)
3. Define Company Admin permissions
4. Define Employer permissions
5. Define Reseller permissions
6. Create permission validation service
7. Create role hierarchy checker
8. Document permission matrix in README
9. Create permission checking helper functions

**Acceptance Criteria:**
- All permissions are clearly defined
- Role hierarchy is enforced
- Permission matrix is documented
- Helper functions validate permissions correctly

**Documentation:** `documentation/project-creation/phase-2/story-2.5-001.md`

---

## Phase 3: Core Backend — Business Logic Services

### Story 3.1-001: Implement Company Service
**Category:** Backend  
**Priority:** High  
**Estimated Effort:** 5 hours  
**Dependencies:** Story 1.1-001, Story 2.4-001

**Description:**
Create company management service with CRUD operations.

**Tasks:**
1. Create `src/companies/companies.service.ts`
2. Implement createCompany() method (Master Admin only)
3. Implement getCompanyById() method with authorization
4. Implement getAllCompanies() method with pagination
5. Implement updateCompany() method
6. Implement uploadLogo() method placeholder
7. Implement getCompanyUsers() method
8. Add service unit tests with mocked repository
9. Add validation for company data

**Acceptance Criteria:**
- Service creates companies with unique NIT
- Pagination works correctly (default 10, options: 5, 10, 20, 25)
- Authorization checks prevent unauthorized access
- Service methods handle errors gracefully
- Unit tests cover all methods

**Documentation:** `documentation/project-creation/phase-3/story-3.1-001.md`

---

### Story 3.2-001: Implement User Service
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 6 hours  
**Dependencies:** Story 1.2-001, Story 2.4-001, Story 3.1-001

**Description:**
Create user management service with role-based operations.

**Tasks:**
1. Create `src/users/users.service.ts`
2. Implement createUser() with role assignment validation
3. Implement getUserById() with authorization
4. Implement getUsersByCompany() with pagination
5. Implement updateUser() with field restrictions
6. Implement deactivateUser() (soft delete)
7. Implement validateUserPermissions() helper
8. Implement checkRoleHierarchy() helper
9. Add service unit tests
10. Add validation for user data

**Acceptance Criteria:**
- Users are created with correct role assignments
- Employers can only create Resellers
- Company Admins cannot create Master Admins
- Deactivation sets isActive to false
- Pagination works correctly
- Unit tests cover all methods

**Documentation:** `documentation/project-creation/phase-3/story-3.2-001.md`

---

### Story 3.3-001: Implement Category Service
**Category:** Backend  
**Priority:** Medium  
**Estimated Effort:** 3 hours  
**Dependencies:** Story 1.3-001, Story 2.4-001

**Description:**
Create category management service for inventory organization.

**Tasks:**
1. Create `src/categories/categories.service.ts`
2. Implement createCategory() for Company Admin/Employer
3. Implement getCategoriesByCompany()
4. Implement updateCategory()
5. Implement deleteCategory() with usage check
6. Implement checkCategoryUsage() helper (check if used in items)
7. Add service unit tests
8. Add validation for category data

**Acceptance Criteria:**
- Categories are unique per company
- Cannot delete categories that are in use
- Only Company Admin and Employer can create categories
- Service prevents duplicate categories
- Unit tests cover all methods

**Documentation:** `documentation/project-creation/phase-3/story-3.3-001.md`

---

### Story 3.4-001: Implement Inventory Service
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 6 hours  
**Dependencies:** Story 1.4-001, Story 2.4-001, Story 3.2-001

**Description:**
Create inventory management service with whitelist control.

**Tasks:**
1. Create `src/inventories/inventories.service.ts`
2. Implement createInventory() with owner validation
3. Implement getInventoryById() with access control
4. Implement getInventoriesByCompany() with pagination
5. Implement getResellerInventories()
6. Implement updateInventory()
7. Implement deleteInventory() with validation (must be empty)
8. Implement addResellerToWhitelist()
9. Implement removeResellerFromWhitelist()
10. Implement checkInventoryAccess() helper
11. Add service unit tests

**Acceptance Criteria:**
- Resellers can only see whitelisted inventories
- Whitelist only accepts reseller user IDs
- Cannot delete inventory with items
- Access control enforces company boundaries
- Pagination works correctly
- Unit tests cover all methods

**Documentation:** `documentation/project-creation/phase-3/story-3.4-001.md`

---

### Story 3.5-001: Implement Item Service
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 6 hours  
**Dependencies:** Story 1.5-001, Story 2.4-001, Story 3.4-001

**Description:**
Create item management service with serial number validation.

**Tasks:**
1. Create `src/items/items.service.ts`
2. Implement addItem() with serial uniqueness check
3. Implement getItemById() with authorization
4. Implement getItemsByInventory() with pagination and category filter
5. Implement updateItem() with serial validation
6. Implement deleteItem()
7. Implement validateSerialUniqueness() helper
8. Implement moveItemBetweenInventories() internal method
9. Add service unit tests
10. Add validation for item data

**Acceptance Criteria:**
- Serial numbers are globally unique
- Items can be filtered by category
- moveItemBetweenInventories() updates inventoryId correctly
- Pagination works correctly
- Price validation ensures positive values
- Unit tests cover all methods

**Documentation:** `documentation/project-creation/phase-3/story-3.5-001.md`

---

### Story 3.6-001: Implement Order Request Service
**Category:** Backend  
**Priority:** Critical  
**Estimated Effort:** 8 hours  
**Dependencies:** Story 1.6-001, Story 2.4-001, Story 3.4-001, Story 3.5-001

**Description:**
Create order request service handling standard and devolution orders with approval workflow.

**Tasks:**
1. Create `src/orders/orders.service.ts`
2. Implement createStandardOrder() for reseller requests
3. Implement createDevolutionOrder() for item returns
4. Implement getOrderById() with authorization
5. Implement getOrdersByCompany() with pagination and filters
6. Implement getOrdersByReseller() with pagination
7. Implement approveOrder() with item transfer logic
8. Implement rejectOrder() with reason validation
9. Implement validateOrderItems() helper (check availability)
10. Implement executeItemTransfer() helper
11. Add transaction support for order approval
12. Add service unit tests

**Acceptance Criteria:**
- Standard orders move items from company to reseller inventory
- Devolution orders move items from reseller to company inventory
- Order approval is atomic (all items or none)
- Rejection requires a reason
- Orders can be filtered by status
- Concurrent approvals are handled correctly
- Unit tests cover all scenarios

**Documentation:** `documentation/project-creation/phase-3/story-3.6-001.md`

---

### Story 3.7-001: Implement Audit Service
**Category:** Backend  
**Priority:** High  
**Estimated Effort:** 5 hours  
**Dependencies:** Story 1.7-001, Story 2.4-001

**Description:**
Create audit logging service with automatic activity tracking.

**Tasks:**
1. Create `src/audits/audits.service.ts`
2. Implement createAuditRecord() method
3. Implement getAuditsByEntity() with pagination
4. Implement getAuditsByActor() with pagination
5. Implement getAuditsByCompany() with pagination
6. Implement getItemAuditTrail() with timeline
7. Create audit interceptor for automatic logging
8. Add filtering by date range, action type
9. Add service unit tests
10. Document audit event structure

**Acceptance Criteria:**
- Audit records are created for all significant actions
- Audit interceptor captures user actions automatically
- Audit trail shows complete item history
- Pagination and filtering work correctly
- Metadata field stores contextual information
- Unit tests cover all methods

**Documentation:** `documentation/project-creation/phase-3/story-3.7-001.md`

---

## Summary by Phase

### **Phase 0:** 7 stories, ~19 hours (Foundation)
### **Phase 1:** 7 stories, ~20 hours (Data Models)
### **Phase 2:** 5 stories, ~23 hours (Auth & Authorization)
### **Phase 3:** 7 stories, ~39 hours (Business Logic)

**Total for Phases 0-3:** 26 stories, ~101 hours

---

## Remaining Phases Overview

Due to the extensive nature of the project, the remaining phases (4-20) will have similar detailed breakdowns created in separate documents:

- **Phase 4-6:** Backend completion (Email, API Endpoints, Testing) — ~15 stories
- **Phase 7-8:** Frontend foundation and authentication — ~12 stories
- **Phase 9-13:** Frontend role-specific screens — ~35 stories
- **Phase 14-15:** File upload and caching — ~6 stories
- **Phase 16-20:** Production readiness — ~20 stories

**Estimated Total:** ~114 stories, ~450-500 hours

---

## Story Template

Each story follows this template structure:

```markdown
# Story [ID]: [Title]

## Metadata
- **Category:** Infrastructure | Backend | Frontend | Testing | Documentation
- **Priority:** Critical | High | Medium | Low
- **Estimated Effort:** X hours
- **Dependencies:** List of story IDs
- **Assignee:** TBD
- **Status:** Not Started | In Progress | In Review | Completed

## Description
[Clear description of what needs to be built]

## Tasks
1. [Specific task]
2. [Specific task]
...

## Acceptance Criteria
- [Testable criterion]
- [Testable criterion]
...

## Technical Notes
[Any important technical considerations]

## Testing Requirements
- Unit tests: [Coverage requirements]
- Integration tests: [What needs testing]

## Documentation Requirements
- [What docs need updating]

## Related Files
- [List of files to create/modify]
```

---

## Progress Tracking

Track progress using the `documentation/status/` directory:
- Create status files per phase
- Update story status regularly
- Track blockers and dependencies

---

## Next Steps

1. **Review this creation plan** with the development team
2. **Create detailed story documents** for Phase 0-3 in `documentation/project-creation/phase-X/` directories
3. **Estimate and prioritize** remaining phases
4. **Assign stories** to team members
5. **Set up project tracking** (Jira, GitHub Projects, etc.)
6. **Begin implementation** with Phase 0 stories

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-28  
**Status:** Ready for Implementation
