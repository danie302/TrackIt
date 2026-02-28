# Story 6.1-001: Unit Tests

## Metadata
- **Category:** Testing
- **Priority:** High
- **Estimated Effort:** 8 hours
- **Dependencies:** Phase 3 (All Services)
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement comprehensive unit tests for all services, guards, decorators, validators, and utility functions. Target 80%+ code coverage.

## Tasks
1. Set up Jest testing framework
2. Create unit tests for all services
3. Test guards and decorators
4. Test validators and pipes
5. Test utility functions
6. Mock all external dependencies
7. Achieve 80%+ code coverage
8. Configure coverage reporting

## Acceptance Criteria
- All services have unit tests
- All guards and decorators tested
- Mock databases and external services
- 80%+ code coverage
- Tests run successfully in CI
- Coverage report generated

## Technical Notes

### Test Structure
```typescript
// Example: companies.service.spec.ts
describe('CompaniesService', () => {
  let service: CompaniesService;
  let mockCompanyModel: any;
  let mockAuditService: any;

  beforeEach(async () => {
    mockCompanyModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockAuditService = {
      createAuditRecord: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: getModelToken(Company.name), useValue: mockCompanyModel },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  describe('createCompany', () => {
    it('should create a company successfully', async () => {
      mockCompanyModel.findOne.mockResolvedValue(null);
      // Test implementation
    });

    it('should throw ConflictException if NIT exists', async () => {
      mockCompanyModel.findOne.mockResolvedValue({ nit: '123' });
      await expect(service.createCompany(dto, actorId)).rejects.toThrow(ConflictException);
    });
  });
});
```

### Coverage Configuration
```json
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Testing Checklist
- [ ] CompaniesService
- [ ] UsersService
- [ ] CategoriesService
- [ ] InventoriesService
- [ ] ItemsService
- [ ] OrderRequestsService
- [ ] AuditService
- [ ] AuthService
- [ ] PasswordService
- [ ] TokenService
- [ ] OtpService
- [ ] EmailService
- [ ] RoleGuard
- [ ] CompanyGuard
- [ ] OwnershipGuard
- [ ] PermissionsGuard
- [ ] Password Validator

## Related Files
- `src/**/*.spec.ts` (create)
- `jest.config.js` (update)
- `package.json` (add test scripts)
