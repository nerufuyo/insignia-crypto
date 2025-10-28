import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserService } from '../../modules/user/user.service';
import type { User } from '@prisma/client';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let userService: UserService;

  const mockUserService = {
    findByToken: jest.fn(),
  };

  const mockUser = {
    id: '1',
    username: 'testuser',
    token: 'validtoken123',
    balance: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    authorization?: string,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization,
          },
          user: undefined,
        }),
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true and attach user when token is valid', async () => {
      mockUserService.findByToken.mockResolvedValue(mockUser);
      const context = createMockExecutionContext('Bearer validtoken123');
      const request = context.switchToHttp().getRequest();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual(mockUser);
      expect(mockUserService.findByToken).toHaveBeenCalledWith(
        'validtoken123',
      );
    });

    it('should accept token without Bearer prefix', async () => {
      mockUserService.findByToken.mockResolvedValue(mockUser);
      const context = createMockExecutionContext('directtoken456');
      const request = context.switchToHttp().getRequest();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual(mockUser);
      expect(mockUserService.findByToken).toHaveBeenCalledWith(
        'directtoken456',
      );
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const context = createMockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Authentication token is required',
      );
      expect(mockUserService.findByToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is empty', async () => {
      const context = createMockExecutionContext('');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Authentication token is required',
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockUserService.findByToken.mockRejectedValue(
        new Error('User not found'),
      );
      const context = createMockExecutionContext('Bearer invalidtoken');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid or expired token',
      );
      expect(mockUserService.findByToken).toHaveBeenCalledWith('invalidtoken');
    });

    it('should extract token correctly from Bearer format', async () => {
      mockUserService.findByToken.mockResolvedValue(mockUser);
      const context = createMockExecutionContext(
        'Bearer abc123def456ghi789',
      );

      await guard.canActivate(context);

      expect(mockUserService.findByToken).toHaveBeenCalledWith(
        'abc123def456ghi789',
      );
    });

    it('should handle Bearer prefix with correct spacing', async () => {
      mockUserService.findByToken.mockResolvedValue(mockUser);
      const context = createMockExecutionContext('Bearer token123');

      await guard.canActivate(context);

      expect(mockUserService.findByToken).toHaveBeenCalledWith('token123');
    });

    it('should handle tokens that start with Bearer as part of the token value', async () => {
      mockUserService.findByToken.mockResolvedValue(mockUser);
      const context = createMockExecutionContext('BearerToken123');

      await guard.canActivate(context);

      // Should treat the whole string as token since there's no space after "Bearer"
      expect(mockUserService.findByToken).toHaveBeenCalledWith(
        'BearerToken123',
      );
    });
  });
});
