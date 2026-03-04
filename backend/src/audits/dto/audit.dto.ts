import { IsOptional, IsEnum, IsObject, IsString } from 'class-validator';
import { EntityType, AuditAction } from '../schemas/audit.schema';

export class CreateAuditDto {
  entityType!: EntityType;
  entityId!: string;
  action!: AuditAction;
  actor!: string;
  description!: string;
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AuditResponseDto {
  _id!: string;
  entityType!: EntityType;
  entityId!: string;
  action!: AuditAction;
  actor!: string;
  description!: string;
  metadata?: Record<string, any>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class AuditQueryDto {
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsString()
  actor?: string;
}
