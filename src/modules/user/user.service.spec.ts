import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = { username: 'testuser' };

    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        token: 'abc123token',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({ token: 'abc123token' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'testuser',
          token: expect.any(String),
          balance: 0,
        },
      });
    });

    it('should throw ConflictException if username already exists', async () => {
      const existingUser = {
        id: '1',
        username: 'testuser',
        token: 'existingtoken',
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Username already exists',
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should generate a unique token for each user', async () => {
      const mockUser1 = {
        id: '1',
        username: 'user1',
        token: 'token1',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser2 = {
        id: '2',
        username: 'user2',
        token: 'token2',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);

      const result1 = await service.register({ username: 'user1' });
      const result2 = await service.register({ username: 'user2' });

      expect(result1.token).toBeDefined();
      expect(result2.token).toBeDefined();
      expect(typeof result1.token).toBe('string');
      expect(typeof result2.token).toBe('string');
      expect(result1.token.length).toBe(64); // 32 bytes = 64 hex chars
      expect(result2.token.length).toBe(64);
    });
  });

  describe('findByToken', () => {
    it('should return user when token is valid', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        token: 'validtoken',
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByToken('validtoken');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { token: 'validtoken' },
      });
    });

    it('should throw NotFoundException when token is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByToken('invalidtoken')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByToken('invalidtoken')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw NotFoundException when token is empty', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByToken('')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    it('should return user when username exists', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        token: 'token123',
        balance: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should throw NotFoundException when username does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByUsername('nonexistent')).rejects.toThrow(
        'User not found',
      );
    });
  });
});
