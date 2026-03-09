import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyResponseDto,
} from './dto/company.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('companies')
@UseGuards(RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(UserRole.MASTER_ADMIN)
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() currentUser: any,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesService.createCompany(
      createCompanyDto,
      currentUser._id.toString(),
    );
    return this.toResponseDto(company);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'name',
    @Query('sortDir') sortDir?: 'asc' | 'desc',
  ): Promise<any> {
    return this.companiesService.getAllCompanies(
      page,
      limit,
      search,
      sortBy === 'name' ? 'name' : 'createdAt',
      sortDir === 'asc' ? 'asc' : 'desc',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CompanyResponseDto> {
    const company = await this.companiesService.getCompanyById(id);
    return this.toResponseDto(company);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() currentUser: any,
  ): Promise<CompanyResponseDto> {
    // COMPANY_ADMIN can only update their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (currentUser.companyId?.toString() !== id) {
        throw new Error('You can only update your own company');
      }
    }

    const company = await this.companiesService.updateCompany(
      id,
      updateCompanyDto,
      currentUser._id.toString(),
    );
    return this.toResponseDto(company);
  }

  @Get(':id/users')
  async getCompanyUsers(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @CurrentUser() currentUser: any,
    @Query('role') role?: UserRole,
  ): Promise<any> {
    // Users can only see users in their own company unless they are MASTER_ADMIN
    if (currentUser.role !== UserRole.MASTER_ADMIN) {
      if (currentUser.companyId?.toString() !== id) {
        throw new Error('You can only view users in your own company');
      }
    }

    return this.companiesService.getCompanyUsers(id, page, limit, role);
  }

  private toResponseDto(company: any): CompanyResponseDto {
    return {
      _id: company._id.toString(),
      name: company.name,
      description: company.description,
      nit: company.nit,
      logo: company.logo,
      userCount: company.userCount,
      createdAt: company.createdAt ?? company.created_at,
      updatedAt: company.updatedAt ?? company.updated_at,
    };
  }
}
