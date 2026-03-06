import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyDocument } from './schemas/company.schema';
import { UsersService } from '../users/users.service';
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
  logo?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  nit?: string;
  logo?: string;
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
    const company = await this.companyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async getAllCompanies(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<CompanyDocument>> {
    const l = normalizeLimit(limit);
    const [data, total] = await Promise.all([
      this.companyModel
        .find()
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.companyModel.countDocuments().exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
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

    if (dto.nit !== undefined) {
      const existing = await this.companyModel
        .findOne({ nit: dto.nit.trim(), _id: { $ne: id } })
        .exec();
      if (existing) {
        throw new ConflictException('Company with this NIT already exists');
      }
    }

    const company = await this.companyModel
      .findByIdAndUpdate(
        id,
        { $set: dto },
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
        changes: dto,
      },
    });

    return company;
  }

  async getCompanyUsers(
    companyId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<unknown>> {
    return this.usersService.getUsersByCompany(companyId, page, limit);
  }
}
