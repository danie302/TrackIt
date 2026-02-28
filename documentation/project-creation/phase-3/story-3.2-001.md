# Story 3.2-001: User Service

## Metadata
- **Category:** Business Logic
- **Priority:** High
- **Estimated Effort:** 6 hours
- **Dependencies:** Story 1.2-001, Story 2.4-001, Story 3.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement User service with CRUD operations, role hierarchy validation, and permission checks. Employers can only create Resellers, Company Admins cannot create Master Admins, and users can be deactivated (soft delete).

## Tasks
1. Create UserService with dependency injection
2. Implement createUser() with role hierarchy validation
3. Implement getUserById() with authorization
4. Implement getUsersByCompany() with filtering
5. Implement updateUser() with permission checks
6. Implement deactivateUser() (soft delete)
7. Implement validateUserPermissions() helper
8. Implement checkRoleHierarchy() helper
9. Add pagination and search functionality
10. Write unit and integration tests

## Acceptance Criteria
- Employers can only create Resellers
- Company Admins cannot create Master Admins
- Deactivation sets isActive=false (not deletion)
- Email must be unique
- Role changes validated against hierarchy
- Users can only be managed by higher roles
- All operations audited
- Proper error messages

## Technical Notes

### User Service Implementation
```typescript
// users/users.service.ts
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { PermissionsService } from '../auth/services/permissions.service';
import { Role } from './enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private auditService: AuditService,
    private permissionsService: PermissionsService,
  ) {}

  async createUser(createUserDto: CreateUserDto, actorId: string, actorRole: Role): Promise<User> {
    // Validate role hierarchy
    this.checkRoleHierarchy(actorRole, createUserDto.role);

    // Check email uniqueness
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const user = new this.userModel({
      ...createUserDto,
      isActive: true,
    });
    await user.save();

    await this.auditService.createAuditRecord({
      entityType: 'User',
      entityId: user.id,
      action: 'CREATE',
      actorId,
      metadata: { email: user.email, role: user.role },
    });

    return user;
  }

  async getUserById(userId: string, actorRole: Role, actorCompanyId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== user.companyId) {
      throw new ForbiddenException('Access denied to this user');
    }

    return user;
  }

  async getUsersByCompany(
    companyId: string,
    actorRole: Role,
    actorCompanyId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== companyId) {
      throw new ForbiddenException('Access denied to this company users');
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.find({ companyId }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments({ companyId }).exec(),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== user.companyId) {
      throw new ForbiddenException('Access denied to update this user');
    }

    // Check role change permission
    if (updateUserDto.role && updateUserDto.role !== user.role) {
      if (!this.permissionsService.canManageUser(actorRole, updateUserDto.role)) {
        throw new ForbiddenException('Cannot assign this role');
      }
    }

    // Check email uniqueness if changed
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateUserDto.email }).exec();
      if (existingUser) {
        throw new ConflictException(`User with email ${updateUserDto.email} already exists`);
      }
    }

    Object.assign(user, updateUserDto);
    await user.save();

    await this.auditService.createAuditRecord({
      entityType: 'User',
      entityId: user.id,
      action: 'UPDATE',
      actorId,
      metadata: { changes: updateUserDto },
    });

    return user;
  }

  async deactivateUser(userId: string, actorId: string, actorRole: Role, actorCompanyId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== user.companyId) {
      throw new ForbiddenException('Access denied to deactivate this user');
    }

    // Cannot deactivate users with higher or equal role
    if (!this.permissionsService.isRoleHigher(actorRole, user.role)) {
      throw new ForbiddenException('Cannot deactivate users with equal or higher role');
    }

    user.isActive = false;
    await user.save();

    await this.auditService.createAuditRecord({
      entityType: 'User',
      entityId: user.id,
      action: 'DEACTIVATE',
      actorId,
      metadata: { email: user.email },
    });

    return user;
  }

  checkRoleHierarchy(actorRole: Role, targetRole: Role): void {
    // Employers can only create Resellers
    if (actorRole === Role.Employer && targetRole !== Role.Reseller) {
      throw new ForbiddenException('Employers can only create Reseller users');
    }

    // Company Admins cannot create Master Admins
    if (actorRole === Role.CompanyAdmin && targetRole === Role.MasterAdmin) {
      throw new ForbiddenException('Company Admins cannot create Master Admin users');
    }

    // Must have higher role to create user
    if (!this.permissionsService.canManageUser(actorRole, targetRole)) {
      throw new ForbiddenException('Insufficient permissions to create user with this role');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword }).exec();
  }
}
```

## Testing Requirements
- Test Employer can only create Resellers
- Test Company Admin cannot create Master Admins
- Test email uniqueness validation
- Test deactivation sets isActive=false
- Test role hierarchy validation
- Test authorization checks
- Test pagination
- Test audit records created

## Documentation Requirements
- Document role hierarchy rules
- Document user lifecycle
- Add API examples
- Document authorization matrix

## Related Files
- `src/users/users.service.ts` (create)
- `src/users/users.controller.ts` (create)
- `src/users/dto/*.dto.ts` (create)
- `src/users/users.module.ts` (create)

## Notes
- Soft delete preserves audit trail
- Consider adding user search functionality
- Password updates should go through password reset flow
- Consider adding bulk operations for user management
