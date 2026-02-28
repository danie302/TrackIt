# Story 5.2-001: Company API Endpoints

## Metadata
- **Category:** API Development
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 3.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement REST API endpoints for company management including CRUD operations, logo upload, and user listing. Master Admin only for creation, Company Admin can update their own company.

## Tasks
1. Update CompaniesController with all endpoints
2. Add request/response DTOs with validation
3. Apply authorization guards
4. Implement pagination for list endpoint
5. Add Swagger documentation
6. Write integration tests
7. Add error handling

## Acceptance Criteria
- All 6 endpoints implemented and working
- Proper authorization (Master Admin, Company Admin)
- Pagination works (default 10 items)
- Input validation with class-validator
- Swagger documentation complete
- Returns correct HTTP status codes
- Integration tests pass

## Technical Notes

### Endpoints
```typescript
POST /api/v1/companies - Create company (Master Admin only)
GET /api/v1/companies - List companies (paginated)
GET /api/v1/companies/:id - Get company details
PUT /api/v1/companies/:id - Update company
POST /api/v1/companies/:id/logo - Upload logo
GET /api/v1/companies/:id/users - Get company users
```

### Controller Implementation
```typescript
@ApiTags('Companies')
@Controller('api/v1/companies')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class CompaniesController {
  @Post()
  @Roles(Role.MasterAdmin)
  @ApiOperation({ summary: 'Create company' })
  @ApiResponse({ status: 201, description: 'Company created' })
  async create(@Body() dto: CreateCompanyDto, @CurrentUser() user: any) {
    return this.companiesService.createCompany(dto, user.id);
  }

  @Get()
  @Roles(Role.MasterAdmin)
  @ApiOperation({ summary: 'List companies' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.companiesService.getAllCompanies(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.getCompanyById(id, user.role, user.companyId);
  }

  @Put(':id')
  @Roles(Role.MasterAdmin, Role.CompanyAdmin)
  @ApiOperation({ summary: 'Update company' })
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @CurrentUser() user: any) {
    return this.companiesService.updateCompany(id, dto, user.id, user.role, user.companyId);
  }

  @Post(':id/logo')
  @Roles(Role.MasterAdmin, Role.CompanyAdmin)
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Upload company logo' })
  async uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    const logoUrl = await this.uploadFile(file);
    return this.companiesService.uploadLogo(id, logoUrl, user.id, user.role, user.companyId);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get company users' })
  async getUsers(@Param('id') id: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.getUsersByCompany(id, page, limit);
  }
}
```

## Testing Requirements
- Test create company (Master Admin)
- Test list companies with pagination
- Test get company by ID
- Test update company (authorization)
- Test logo upload
- Test get company users
- Test authorization for each endpoint

## Related Files
- `src/companies/companies.controller.ts` (update)
- `src/companies/dto/*.dto.ts` (update)

## Notes
- Logo upload handled in Phase 14
- Users list endpoint delegates to UsersService
