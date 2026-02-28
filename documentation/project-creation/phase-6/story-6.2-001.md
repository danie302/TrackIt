# Story 6.2-001: Integration Tests

## Metadata
- **Category:** Testing
- **Priority:** High
- **Estimated Effort:** 8 hours
- **Dependencies:** Phase 5 (All API Endpoints)
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement integration tests for all API endpoints using test database. Test authentication flows, authorization scenarios, and complete workflows.

## Tasks
1. Set up test database configuration
2. Create integration test suite for each module
3. Test authentication flows
4. Test authorization scenarios
5. Test order approval workflow
6. Test audit creation
7. Clean up test data after each test

## Acceptance Criteria
- All API endpoints have integration tests
- Test database properly configured
- Authentication and authorization tested
- Complete workflows tested
- Tests run in isolated environment
- Test data cleanup automated

## Technical Notes

### Test Setup
```typescript
// test/app.e2e-spec.ts
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key) => {
          if (key === 'MONGODB_URI') return 'mongodb://localhost:27017/trackit_test';
          return null;
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Authentication', () => {
    it('/api/v1/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: 'Test123!' })
        .expect(200)
        .then(res => {
          authToken = res.body.accessToken;
          expect(authToken).toBeDefined();
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Test Coverage
- Authentication endpoints
- Company CRUD operations
- User management with role hierarchy
- Inventory and item operations
- Order creation and approval
- Audit trail creation

## Related Files
- `test/**/*.e2e-spec.ts` (create)
- `test/jest-e2e.json` (create)
