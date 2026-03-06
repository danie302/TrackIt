import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AuditDocument,
  EntityType,
  AuditAction,
} from './schemas/audit.schema';
import {
  normalizeLimit,
  paginateSkip,
  toPaginatedResult,
  type PaginatedResult,
} from '../common/pagination.dto';

export interface CreateAuditDto {
  entityType: EntityType;
  entityId: Types.ObjectId;
  action: AuditAction;
  actor: Types.ObjectId;
  description: string;
  metadata?: Record<string, unknown>;
  companyId?: Types.ObjectId;
}

@Injectable()
export class AuditsService {
  constructor(
    @InjectModel('Audit') private auditModel: Model<AuditDocument>,
  ) {}

  async createAuditRecord(dto: CreateAuditDto): Promise<AuditDocument> {
    const record = await this.auditModel.create(dto);
    return record;
  }

  async getAuditsByEntity(
    entityType: EntityType,
    entityId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<AuditDocument>> {
    const l = normalizeLimit(limit);
    const [data, total] = await Promise.all([
      this.auditModel
        .find({ entityType, entityId: new Types.ObjectId(entityId) })
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.auditModel
        .countDocuments({ entityType, entityId: new Types.ObjectId(entityId) })
        .exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async getAuditsByActor(
    actorId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<AuditDocument>> {
    const l = normalizeLimit(limit);
    const [data, total] = await Promise.all([
      this.auditModel
        .find({ actor: new Types.ObjectId(actorId) })
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.auditModel.countDocuments({ actor: new Types.ObjectId(actorId) }).exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async getAuditsByCompany(
    companyId: string,
    page = 1,
    limit = 10,
    action?: AuditAction,
  ): Promise<PaginatedResult<AuditDocument>> {
    const l = normalizeLimit(limit);
    const filter: Record<string, unknown> = { companyId: new Types.ObjectId(companyId) };
    if (action) filter.action = action;
    const [data, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.auditModel.countDocuments(filter).exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async getItemAuditTrail(
    itemId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<AuditDocument>> {
    return this.getAuditsByEntity(EntityType.ITEM, itemId, page, limit);
  }
}
