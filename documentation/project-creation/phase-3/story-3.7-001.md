# Story 3.7-001: Audit Service

## Metadata
- **Category:** Business Logic
- **Priority:** High
- **Estimated Effort:** 5 hours
- **Dependencies:** Story 1.7-001, Story 2.4-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement comprehensive Audit service with automatic logging interceptor and query capabilities. Audit ALL significant actions including user management, inventory operations, orders, and item movements.

## Tasks
1. Create AuditService with dependency injection
2. Implement createAuditRecord() method
3. Implement getAuditsByEntity() for entity-specific audits
4. Implement getAuditsByActor() for user activity tracking
5. Implement getAuditsByCompany() for company audit trail
6. Implement getItemAuditTrail() for complete item history
7. Create audit interceptor for automatic logging
8. Add date range filtering
9. Add action type filtering
10. Write unit and integration tests

## Acceptance Criteria
- All significant actions audited automatically
- Metadata stored as flexible JSON
- Filter by date range, action type, entity
- Complete item audit trail
- Company-level audit access control
- Pagination support
- Efficient querying with indexes

## Technical Notes

### Audit Service Implementation
```typescript
// audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit } from './schemas/audit.schema';
import { CreateAuditDto } from './dto/create-audit.dto';
import { EntityType, AuditAction } from './enums/audit.enums';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private auditModel: Model<Audit>,
  ) {}

  async createAuditRecord(createAuditDto: CreateAuditDto): Promise<Audit> {
    const audit = new this.auditModel({
      ...createAuditDto,
      timestamp: new Date(),
    });
    await audit.save();
    return audit;
  }

  async getAuditsByEntity(
    entityType: EntityType,
    entityId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    audits: Audit[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [audits, total] = await Promise.all([
      this.auditModel
        .find({ entityType, entityId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments({ entityType, entityId }).exec(),
    ]);

    return {
      audits,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditsByActor(
    actorId: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    audits: Audit[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = { actorId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [audits, total] = await Promise.all([
      this.auditModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments(query).exec(),
    ]);

    return {
      audits,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditsByCompany(
    companyId: string,
    actionFilter?: AuditAction[],
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    audits: Audit[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {
      $or: [
        { 'metadata.companyId': companyId },
        { entityType: 'Company', entityId: companyId },
      ],
    };

    if (actionFilter && actionFilter.length > 0) {
      query.action = { $in: actionFilter };
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [audits, total] = await Promise.all([
      this.auditModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments(query).exec(),
    ]);

    return {
      audits,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getItemAuditTrail(itemId: string): Promise<Audit[]> {
    return this.auditModel
      .find({
        $or: [
          { entityType: EntityType.Item, entityId: itemId },
          { 'metadata.itemId': itemId },
        ],
      })
      .sort({ timestamp: 1 }) // Chronological order for trail
      .exec();
  }
}
```

### Audit Interceptor
```typescript
// audit/interceptors/audit.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';

export const AUDIT_LOG = 'audit_log';
export const AuditLog = (entityType: string, action: string) =>
  SetMetadata(AUDIT_LOG, { entityType, action });

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get(AUDIT_LOG, context.getHandler());

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(async (data) => {
        if (data && data.id) {
          await this.auditService.createAuditRecord({
            entityType: auditMetadata.entityType,
            entityId: data.id,
            action: auditMetadata.action,
            actorId: user.id,
            metadata: this.extractMetadata(data),
          });
        }
      }),
    );
  }

  private extractMetadata(data: any): any {
    // Extract relevant fields for metadata
    const metadata: any = {};
    if (data.name) metadata.name = data.name;
    if (data.email) metadata.email = data.email;
    if (data.companyId) metadata.companyId = data.companyId;
    if (data.serial) metadata.serial = data.serial;
    return metadata;
  }
}
```

### DTOs
```typescript
// audit/dto/create-audit.dto.ts
import { IsEnum, IsString, IsNotEmpty, IsObject } from 'class-validator';
import { EntityType, AuditAction } from '../enums/audit.enums';

export class CreateAuditDto {
  @IsEnum(EntityType)
  entityType: EntityType;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsString()
  @IsNotEmpty()
  actorId: string;

  @IsObject()
  metadata: Record<string, any>;
}
```

### Enums
```typescript
// audit/enums/audit.enums.ts
export enum EntityType {
  Company = 'Company',
  User = 'User',
  Category = 'Category',
  Inventory = 'Inventory',
  Item = 'Item',
  OrderRequest = 'OrderRequest',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DEACTIVATE = 'DEACTIVATE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  TRANSFER = 'TRANSFER',
}
```

## Testing Requirements
- Test audit record creation
- Test query by entity
- Test query by actor
- Test query by company
- Test date range filtering
- Test action type filtering
- Test item audit trail
- Test pagination
- Test audit interceptor

## Documentation Requirements
- Document audited actions
- Document audit query capabilities
- Document metadata structure
- Add examples of audit queries

## Related Files
- `src/audit/audit.service.ts` (create)
- `src/audit/audit.controller.ts` (create)
- `src/audit/interceptors/audit.interceptor.ts` (create)
- `src/audit/dto/create-audit.dto.ts` (create)
- `src/audit/enums/audit.enums.ts` (create)
- `src/audit/audit.module.ts` (create)

## Notes
- Audit records are immutable
- Consider data retention policies
- Add indexes on entityType, entityId, actorId, timestamp
- Consider audit log archiving for old records
- Audit interceptor can be applied globally or per-controller
