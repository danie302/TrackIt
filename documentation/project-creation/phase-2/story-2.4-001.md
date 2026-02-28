# Story 2.4-001: Authorization Guards and Decorators

## Metadata
- **Category:** Security
- **Priority:** High
- **Estimated Effort:** 5 hours
- **Dependencies:** Story 2.1-001, Story 1.2-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement comprehensive authorization system with guards for role-based access control, resource ownership validation, and company data isolation. Create custom decorators for clean authorization implementation.

## Tasks
1. Create RoleGuard for role-based access control
2. Create OwnershipGuard for resource ownership validation
3. Create CompanyGuard for company data isolation
4. Implement @Roles() decorator
5. Implement @RequirePermissions() decorator
6. Implement @CurrentUser() decorator (if not done in 2.3-001)
7. Create guard composition utility
8. Add metadata reflection for guards
9. Write unit tests for all guards
10. Document guard usage patterns

## Acceptance Criteria
- RoleGuard blocks users without required roles
- OwnershipGuard validates resource ownership correctly
- CompanyGuard enforces company data isolation
- Decorators can be applied to controller methods
- Guards can be composed together
- Guards return proper error messages
- Master Admin bypasses company isolation
- Guards work with Swagger documentation

## Technical Notes

### Roles Decorator
```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### Role Guard
```typescript
// auth/guards/role.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}. User has: ${user.role}`
      );
    }

    return true;
  }
}
```

### Company Guard
```typescript
// auth/guards/company.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum';

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const companyId = request.params.companyId || request.body?.companyId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Master Admin can access all companies
    if (user.role === Role.MasterAdmin) {
      return true;
    }

    // Resellers can only access their whitelisted companies
    if (user.role === Role.Reseller) {
      // This will be validated in the service layer with whitelist
      return true;
    }

    // Other users can only access their own company
    if (companyId && user.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this company data');
    }

    return true;
  }
}
```

### Ownership Guard
```typescript
// auth/guards/ownership.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/enums/role.enum';

export const OWNERSHIP_KEY = 'ownership';
export const RequireOwnership = (resourceType: string) =>
  SetMetadata(OWNERSHIP_KEY, resourceType);

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const resourceType = this.reflector.getAllAndOverride<string>(OWNERSHIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!resourceType) {
      return true; // No ownership check required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceUserId = request.params.userId || request.body?.userId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Master Admin and Company Admin can access any resource in their scope
    if (user.role === Role.MasterAdmin || user.role === Role.CompanyAdmin) {
      return true;
    }

    // Regular users can only access their own resources
    if (resourceUserId && user.id !== resourceUserId) {
      throw new ForbiddenException('Access denied to this resource');
    }

    return true;
  }
}
```

### Permissions Decorator and Guard
```typescript
// auth/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// auth/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionsService } from '../services/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermission = requiredPermissions.every((permission) =>
      this.permissionsService.hasPermission(user.role, permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}
```

### Usage Examples
```typescript
// Example: Role-based access
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UsersController {
  @Get()
  @Roles(Role.MasterAdmin, Role.CompanyAdmin)
  findAll() {
    // Only Master Admin and Company Admin can access
  }

  @Post()
  @Roles(Role.CompanyAdmin)
  @UseGuards(CompanyGuard)
  create(@Body() createUserDto: CreateUserDto) {
    // Only Company Admin can create users in their company
  }
}

// Example: Ownership validation
@Controller('api/v1/profile')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class ProfileController {
  @Get(':userId')
  @RequireOwnership('user')
  getProfile(@Param('userId') userId: string) {
    // Users can only access their own profile
    // Admins can access any profile
  }
}

// Example: Permission-based access
@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  @Post()
  @RequirePermissions('inventory:create')
  createInventory(@Body() dto: CreateInventoryDto) {
    // Only users with inventory:create permission
  }

  @Delete(':id')
  @RequirePermissions('inventory:delete')
  deleteInventory(@Param('id') id: string) {
    // Only users with inventory:delete permission
  }
}

// Example: Composing multiple guards
@Controller('api/v1/items')
@UseGuards(JwtAuthGuard, RoleGuard, CompanyGuard)
export class ItemsController {
  @Get()
  @Roles(Role.Employer, Role.CompanyAdmin)
  findAll(@CurrentUser() user: any) {
    // Must be authenticated, have Employer or CompanyAdmin role,
    // and belong to the correct company
  }
}
```

### Global Guard Configuration
```typescript
// app.module.ts
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Apply JWT auth globally
    },
  ],
})
export class AppModule {}
```

## Testing Requirements
- Test RoleGuard allows access with correct role
- Test RoleGuard denies access with wrong role
- Test CompanyGuard allows access to own company
- Test CompanyGuard denies access to other company
- Test CompanyGuard allows Master Admin access to all
- Test OwnershipGuard allows access to own resources
- Test OwnershipGuard denies access to others' resources
- Test PermissionsGuard validates permissions correctly
- Test guards can be composed
- Test proper error messages are returned

## Documentation Requirements
- Document all guards and their usage
- Create authorization flow diagram
- Document role hierarchy
- Add examples for common authorization patterns
- Document how to combine multiple guards

## Related Files
- `src/auth/guards/role.guard.ts` (create)
- `src/auth/guards/company.guard.ts` (create)
- `src/auth/guards/ownership.guard.ts` (create)
- `src/auth/guards/permissions.guard.ts` (create)
- `src/auth/decorators/roles.decorator.ts` (create)
- `src/auth/decorators/permissions.decorator.ts` (create)
- `src/app.module.ts` (update)

## Notes
- Guards are executed after all interceptors but before pipes
- Guards should return boolean or throw exceptions
- Use Reflector to access metadata from decorators
- Master Admin should bypass most restrictions
- Consider implementing audit logging in guards
- Guards can be applied at controller or method level
- Combine guards using @UseGuards() with multiple guards
