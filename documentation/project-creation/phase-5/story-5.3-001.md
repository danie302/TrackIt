# Story 5.3-001: User API Endpoints

## Metadata
- **Category:** API Development
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 3.2-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement REST API endpoints for user management with role-based creation, filtering, and soft delete (deactivation).

## Tasks
1. Create UsersController with all endpoints
2. Add request/response DTOs with validation
3. Apply role-based guards
4. Implement pagination and filtering
5. Add Swagger documentation
6. Write integration tests

## Endpoints
```
POST /api/v1/users - Create user
GET /api/v1/users - List users (paginated, filtered)
GET /api/v1/users/:id - Get user details
PUT /api/v1/users/:id - Update user
DELETE /api/v1/users/:id - Deactivate user
```

## Controller Sketch
```typescript
@ApiTags('Users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UsersController {
  @Post()
  @Roles(Role.MasterAdmin, Role.CompanyAdmin, Role.Employer)
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.createUser(dto, user.id, user.role);
  }

  @Get()
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  async findAll(@Query() query: FilterUsersDto) {
    return this.usersService.getUsersByCompany(query.companyId, user.role, user.companyId, query.page, query.limit);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.deactivateUser(id, user.id, user.role, user.companyId);
  }
}
```

## Related Files
- `src/users/users.controller.ts` (create)
- `src/users/dto/*.dto.ts` (create)
