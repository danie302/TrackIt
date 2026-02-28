# Story 3.1-001: Company Service

## Metadata
- **Category:** Business Logic
- **Priority:** High
- **Estimated Effort:** 5 hours
- **Dependencies:** Story 1.1-001, Story 2.4-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement comprehensive Company service with CRUD operations, logo upload support, and user management. Only Master Admin can create companies, while Company Admin can update their own company information.

## Tasks
1. Create CompanyService with dependency injection
2. Implement createCompany() method with NIT uniqueness validation
3. Implement getCompanyById() with authorization checks
4. Implement getAllCompanies() with pagination support
5. Implement updateCompany() with authorization checks
6. Implement uploadLogo() with file validation
7. Implement getCompanyUsers() to fetch all users in a company
8. Add transaction support for critical operations
9. Implement input validation and error handling
10. Write unit and integration tests

## Acceptance Criteria
- Only Master Admin can create companies
- NIT must be unique across all companies
- Company Admin can update only their own company
- Logo upload accepts images only (jpg, png, max 2MB)
- getAllCompanies() returns paginated results (10 per page default)
- Proper error messages for all edge cases
- All operations have audit trail
- Transaction rollback on failure

## Technical Notes

### Company Service Implementation
```typescript
// companies/companies.service.ts
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuditService } from '../audit/audit.service';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private auditService: AuditService,
  ) {}

  async createCompany(createCompanyDto: CreateCompanyDto, actorId: string): Promise<Company> {
    // Check NIT uniqueness
    const existingCompany = await this.companyModel.findOne({ 
      nit: createCompanyDto.nit 
    }).exec();
    
    if (existingCompany) {
      throw new ConflictException(`Company with NIT ${createCompanyDto.nit} already exists`);
    }

    const company = new this.companyModel(createCompanyDto);
    await company.save();

    await this.auditService.createAuditRecord({
      entityType: 'Company',
      entityId: company.id,
      action: 'CREATE',
      actorId,
      metadata: { name: company.name, nit: company.nit },
    });

    return company;
  }

  async getCompanyById(companyId: string, actorRole: Role, actorCompanyId: string): Promise<Company> {
    const company = await this.companyModel.findById(companyId).exec();
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== companyId) {
      throw new ForbiddenException('Access denied to this company');
    }

    return company;
  }

  async getAllCompanies(page: number = 1, limit: number = 10): Promise<{
    companies: Company[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      this.companyModel.find().skip(skip).limit(limit).exec(),
      this.companyModel.countDocuments().exec(),
    ]);

    return {
      companies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateCompany(
    companyId: string,
    updateCompanyDto: UpdateCompanyDto,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<Company> {
    const company = await this.companyModel.findById(companyId).exec();
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== companyId) {
      throw new ForbiddenException('Access denied to update this company');
    }

    // Check NIT uniqueness if being updated
    if (updateCompanyDto.nit && updateCompanyDto.nit !== company.nit) {
      const existingCompany = await this.companyModel.findOne({
        nit: updateCompanyDto.nit,
      }).exec();
      
      if (existingCompany) {
        throw new ConflictException(`Company with NIT ${updateCompanyDto.nit} already exists`);
      }
    }

    Object.assign(company, updateCompanyDto);
    await company.save();

    await this.auditService.createAuditRecord({
      entityType: 'Company',
      entityId: company.id,
      action: 'UPDATE',
      actorId,
      metadata: { changes: updateCompanyDto },
    });

    return company;
  }

  async uploadLogo(
    companyId: string,
    logoUrl: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<Company> {
    const company = await this.companyModel.findById(companyId).exec();
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== companyId) {
      throw new ForbiddenException('Access denied to update this company logo');
    }

    company.logo = logoUrl;
    await company.save();

    await this.auditService.createAuditRecord({
      entityType: 'Company',
      entityId: company.id,
      action: 'UPDATE',
      actorId,
      metadata: { action: 'logo_upload', logoUrl },
    });

    return company;
  }

  async getCompanyUsers(companyId: string): Promise<any[]> {
    // This will be implemented in User Service
    // Placeholder for reference
    return [];
  }
}
```

### DTOs
```typescript
// companies/dto/create-company.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Tech Solutions Inc.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  nit: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;
}

// companies/dto/update-company.dto.ts
export class UpdateCompanyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;
}
```

### Controller with File Upload
```typescript
// companies/companies.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Companies')
@Controller('api/v1/companies')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  @Roles(Role.MasterAdmin)
  @ApiOperation({ summary: 'Create new company (Master Admin only)' })
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() user: any,
  ) {
    return this.companiesService.createCompany(createCompanyDto, user.id);
  }

  @Get()
  @Roles(Role.MasterAdmin)
  @ApiOperation({ summary: 'Get all companies with pagination' })
  async getAllCompanies(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.companiesService.getAllCompanies(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  async getCompanyById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.getCompanyById(id, user.role, user.companyId);
  }

  @Put(':id')
  @Roles(Role.MasterAdmin, Role.CompanyAdmin)
  @ApiOperation({ summary: 'Update company' })
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: any,
  ) {
    return this.companiesService.updateCompany(
      id,
      updateCompanyDto,
      user.id,
      user.role,
      user.companyId,
    );
  }

  @Post(':id/logo')
  @Roles(Role.MasterAdmin, Role.CompanyAdmin)
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Upload company logo' })
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    // Upload to storage and get URL (implement storage service)
    const logoUrl = await this.uploadFileToStorage(file);
    return this.companiesService.uploadLogo(
      id,
      logoUrl,
      user.id,
      user.role,
      user.companyId,
    );
  }

  private async uploadFileToStorage(file: Express.Multer.File): Promise<string> {
    // Implement file upload logic (local storage or S3)
    // Return the file URL
    return `https://storage.example.com/${file.filename}`;
  }
}
```

## Testing Requirements
- Test Master Admin can create companies
- Test non-Master Admin cannot create companies
- Test NIT uniqueness validation
- Test Company Admin can update own company
- Test Company Admin cannot update other companies
- Test pagination works correctly
- Test logo upload accepts valid images
- Test logo upload rejects invalid files
- Test logo upload respects size limit
- Test audit records are created for all operations

## Documentation Requirements
- Document all API endpoints with Swagger
- Document authorization rules
- Document pagination parameters
- Document file upload requirements
- Add examples for common operations

## Related Files
- `src/companies/companies.service.ts` (create)
- `src/companies/companies.controller.ts` (create)
- `src/companies/dto/create-company.dto.ts` (create)
- `src/companies/dto/update-company.dto.ts` (create)
- `src/companies/companies.module.ts` (create)

## Notes
- File uploads require multer configuration
- Consider using cloud storage (S3) for production
- Implement file cleanup for replaced logos
- Pagination should be consistent across all list endpoints
- Consider adding search functionality
- NIT validation should support different formats if needed
