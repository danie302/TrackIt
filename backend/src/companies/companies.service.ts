import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyDocument } from './schemas/company.schema';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import { AuditsService } from '../audits/audits.service';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';
import {
  normalizeLimit,
  paginateSkip,
  toPaginatedResult,
  type PaginatedResult,
} from '../common/pagination.dto';

export interface CreateCompanyDto {
  name: string;
  nit: string;
  description?: string;
  logo?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  nit?: string;
  description?: string;
  logo?: string;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel('Company') private companyModel: Model<CompanyDocument>,
    private usersService: UsersService,
    private auditsService: AuditsService,
  ) {}

  async createCompany(dto: CreateCompanyDto, actorId: string): Promise<CompanyDocument> {
    const existing = await this.companyModel.findOne({ nit: dto.nit.trim() }).exec();
    if (existing) {
      throw new ConflictException('Company with this NIT already exists');
    }
    const company = await this.companyModel.create({
      name: dto.name,
      description: dto.description,
      nit: dto.nit.trim(),
      logo: dto.logo,
    });

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.COMPANY,
      entityId: company._id,
      action: AuditAction.CREATE,
      actor: new Types.ObjectId(actorId),
      description: `Created company: ${company.name}`,
      companyId: company._id,
    });

    return company;
  }

  async getCompanyById(id: string): Promise<CompanyDocument> {
    const [company] = await this.companyModel.collection
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            nit: 1,
            logo: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .toArray();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const counts = await this.usersService.countUsersByCompanyIds([company._id.toString()]);
    return Object.assign(company, {
      userCount: counts[company._id.toString()] ?? 0,
    }) as unknown as CompanyDocument;
  }

  async getAllCompanies(
    page = 1,
    limit = 10,
    search?: string,
    sortBy: 'createdAt' | 'name' = 'createdAt',
    sortDir: 'asc' | 'desc' = 'desc',
  ): Promise<PaginatedResult<(CompanyDocument & { userCount?: number })>> {
    const l = normalizeLimit(limit);
    const q = search?.trim();
    const filter: Record<string, unknown> = {};
    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: re }, { description: re }, { nit: re }];
    }

    const sort: Record<string, 1 | -1> =
      sortBy === 'name'
        ? { name: sortDir === 'asc' ? 1 : -1, createdAt: -1 }
        : { createdAt: sortDir === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.companyModel
        .find(filter)
        .sort(sort)
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.companyModel.countDocuments(filter).exec(),
    ]);

    const counts = await this.usersService.countUsersByCompanyIds(
      data.map((c) => c._id.toString()),
    );

    const withCounts = data.map((doc) => {
      const raw = (doc as any).toObject ? (doc as any).toObject() : doc;
      return {
        ...raw,
        userCount: counts[doc._id.toString()] ?? 0,
        createdAt: raw.createdAt ?? raw.created_at,
        updatedAt: raw.updatedAt ?? raw.updated_at,
      };
    });

    return toPaginatedResult(withCounts as any, total, page, l);
  }

  async updateCompany(
    id: string,
    dto: UpdateCompanyDto,
    actorId: string,
  ): Promise<CompanyDocument> {
    const oldCompany = await this.companyModel.findById(id).exec();
    if (!oldCompany) {
      throw new NotFoundException('Company not found');
    }

    const toSet: UpdateCompanyDto = { ...dto };
    if (toSet.nit !== undefined) {
      toSet.nit = toSet.nit.trim();
      const existing = await this.companyModel
        .findOne({ nit: toSet.nit, _id: { $ne: id } })
        .exec();
      if (existing) {
        throw new ConflictException('Company with this NIT already exists');
      }
    }

    const company = await this.companyModel
      .findByIdAndUpdate(
        id,
        { $set: toSet },
        { new: true },
      )
      .exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.COMPANY,
      entityId: company._id,
      action: AuditAction.UPDATE,
      actor: new Types.ObjectId(actorId),
      description: `Updated company: ${company.name}`,
      companyId: company._id,
      metadata: {
        changes: toSet,
      },
    });

    return company;
  }

  async getCompanyUsers(
    companyId: string,
    page = 1,
    limit = 10,
    role?: UserRole,
  ): Promise<PaginatedResult<unknown>> {
    return this.usersService.getUsersByCompany(companyId, page, limit, role);
  }
}
