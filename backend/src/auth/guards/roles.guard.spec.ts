import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

function createMockExecutionContext(user?: { role: UserRole } | null): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(user !== undefined ? { user } : {}),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when no roles are required', () => {
    it('returns true if ROLES_KEY metadata is undefined', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const ctx = createMockExecutionContext({ role: UserRole.RESELLER });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('returns true if ROLES_KEY metadata is an empty array', () => {
      reflector.getAllAndOverride.mockReturnValue([]);
      const ctx = createMockExecutionContext({ role: UserRole.RESELLER });

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('when roles are required', () => {
    it('returns true if user has a matching role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.COMPANY_ADMIN]);
      const ctx = createMockExecutionContext({ role: UserRole.COMPANY_ADMIN });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('returns true if user has one of multiple allowed roles', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN]);
      const ctx = createMockExecutionContext({ role: UserRole.COMPANY_ADMIN });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('returns true for MASTER_ADMIN when role is in required list', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.MASTER_ADMIN]);
      const ctx = createMockExecutionContext({ role: UserRole.MASTER_ADMIN });

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('throws ForbiddenException if user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.MASTER_ADMIN]);
      const ctx = createMockExecutionContext({ role: UserRole.RESELLER });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(ctx)).toThrow('Insufficient permissions');
    });

    it('throws ForbiddenException if user role is Employer but CompanyAdmin is required', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.COMPANY_ADMIN]);
      const ctx = createMockExecutionContext({ role: UserRole.EMPLOYER });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException if there is no user in the request', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.COMPANY_ADMIN]);
      const ctx = createMockExecutionContext(null);

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(ctx)).toThrow('Access denied');
    });

    it('throws ForbiddenException when user is undefined (no user property)', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.EMPLOYER]);
      // Context with no user property at all
      const ctx = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('reflector usage', () => {
    it('calls reflector.getAllAndOverride with ROLES_KEY', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const ctx = createMockExecutionContext({ role: UserRole.MASTER_ADMIN });

      guard.canActivate(ctx);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]);
    });
  });
});
