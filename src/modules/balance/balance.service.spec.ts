import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';

describe('BalanceService', () => {
  let service: BalanceService;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    token: 'token123',
    balance: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('topup', () => {
    it('should successfully top up user balance', async () => {
      const topupDto = { amount: 500 };

      // Mock the transaction callback
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const result = await service.topup(mockUser, topupDto);

      expect(result).toEqual({ message: 'Top-up successful' });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should increment user balance by the specified amount', async () => {
      const topupDto = { amount: 1000 };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      await service.topup(mockUser, topupDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          balance: {
            increment: 1000,
          },
        },
      });
    });

    it('should create a transaction record for top-up', async () => {
      const topupDto = { amount: 2500 };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      await service.topup(mockUser, topupDto);

      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          fromUsername: 'testuser',
          toUsername: 'testuser',
          amount: 2500,
          type: 'topup',
        },
      });
    });

    it('should handle positive decimal amounts', async () => {
      const topupDto = { amount: 123.45 };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      await service.topup(mockUser, topupDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          balance: {
            increment: 123.45,
          },
        },
      });
    });

    it('should handle maximum allowed amount (10,000,000)', async () => {
      const topupDto = { amount: 10000000 };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const result = await service.topup(mockUser, topupDto);

      expect(result).toEqual({ message: 'Top-up successful' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          balance: {
            increment: 10000000,
          },
        },
      });
    });

    it('should rollback on transaction failure', async () => {
      const topupDto = { amount: 500 };

      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(service.topup(mockUser, topupDto)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        balance: 1500,
      });

      const result = await service.getBalance(mockUser);

      expect(result).toEqual({ balance: 1500 });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { balance: true },
      });
    });

    it('should return zero balance for new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        balance: 0,
      });

      const result = await service.getBalance(mockUser);

      expect(result).toEqual({ balance: 0 });
    });

    it('should return decimal balance correctly', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        balance: 1234.56,
      });

      const result = await service.getBalance(mockUser);

      expect(result).toEqual({ balance: 1234.56 });
    });

    it('should throw error when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getBalance(mockUser)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
