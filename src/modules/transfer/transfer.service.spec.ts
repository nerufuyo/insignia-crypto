import { Test, TestingModule } from '@nestjs/testing';
import { TransferService } from './transfer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';

describe('TransferService', () => {
  let service: TransferService;
  let prismaService: PrismaService;

  const mockSender: User = {
    id: '1',
    username: 'sender',
    token: 'token123',
    balance: 5000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRecipient: User = {
    id: '2',
    username: 'recipient',
    token: 'token456',
    balance: 2000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transfer', () => {
    it('should successfully transfer funds between users', async () => {
      const transferDto = { to_username: 'recipient', amount: 1000 };

      mockPrismaService.user.findUnique.mockResolvedValue(mockRecipient);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const result = await service.transfer(mockSender, transferDto);

      expect(result).toEqual({ message: 'Transfer successful' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'recipient' },
      });
    });

    it('should deduct amount from sender balance', async () => {
      const transferDto = { to_username: 'recipient', amount: 1500 };

      mockPrismaService.user.findUnique.mockResolvedValue(mockRecipient);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      await service.transfer(mockSender, transferDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          balance: {
            decrement: 1500,
          },
        },
      });
    });

    it('should add amount to recipient balance', async () => {
      const transferDto = { to_username: 'recipient', amount: 1500 };

      mockPrismaService.user.findUnique.mockResolvedValue(mockRecipient);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      await service.transfer(mockSender, transferDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '2' },
        data: {
          balance: {
            increment: 1500,
          },
        },
      });
    });

    it('should create a transaction record', async () => {
      const transferDto = { to_username: 'recipient', amount: 2000 };

      mockPrismaService.user.findUnique.mockResolvedValue(mockRecipient);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      await service.transfer(mockSender, transferDto);

      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          fromUsername: 'sender',
          toUsername: 'recipient',
          amount: 2000,
          type: 'transfer',
        },
      });
    });

    it('should throw error for self-transfer', async () => {
      const transferDto = { to_username: 'sender', amount: 100 };

      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        'Cannot transfer to yourself',
      );
    });

    it('should throw error for negative amount', async () => {
      const transferDto = { to_username: 'recipient', amount: -100 };

      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        'Transfer amount must be positive',
      );
    });

    it('should throw error for zero amount', async () => {
      const transferDto = { to_username: 'recipient', amount: 0 };

      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        'Transfer amount must be positive',
      );
    });

    it('should throw error for insufficient balance', async () => {
      const transferDto = { to_username: 'recipient', amount: 10000 };

      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        'Insufficient balance',
      );
    });

    it('should throw error when recipient does not exist', async () => {
      const transferDto = { to_username: 'nonexistent', amount: 100 };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        "User 'nonexistent' not found",
      );
    });

    it('should handle decimal amounts correctly', async () => {
      const transferDto = { to_username: 'recipient', amount: 123.45 };

      mockPrismaService.user.findUnique.mockResolvedValue(mockRecipient);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const result = await service.transfer(mockSender, transferDto);

      expect(result).toEqual({ message: 'Transfer successful' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          balance: {
            decrement: 123.45,
          },
        },
      });
    });

    it('should rollback on transaction failure', async () => {
      const transferDto = { to_username: 'recipient', amount: 1000 };

      mockPrismaService.user.findUnique.mockResolvedValue(mockRecipient);
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.transfer(mockSender, transferDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should allow transfer of entire balance', async () => {
      const transferDto = { to_username: 'recipient', amount: 5000 };

      mockPrismaService.user.findUnique.mockResolvedValue(mockRecipient);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const result = await service.transfer(mockSender, transferDto);

      expect(result).toEqual({ message: 'Transfer successful' });
    });
  });
});
