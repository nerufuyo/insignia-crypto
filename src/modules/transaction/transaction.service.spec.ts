import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { User, Transaction } from '@prisma/client';

describe('TransactionService', () => {
  let service: TransactionService;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    token: 'token123',
    balance: 5000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      fromUsername: 'testuser',
      toUsername: 'user1',
      amount: 5000,
      type: 'transfer',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      fromUsername: 'user2',
      toUsername: 'testuser',
      amount: 3000,
      type: 'transfer',
      createdAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      fromUsername: 'testuser',
      toUsername: 'user3',
      amount: 2000,
      type: 'transfer',
      createdAt: new Date('2024-01-03'),
    },
    {
      id: '4',
      fromUsername: 'user4',
      toUsername: 'testuser',
      amount: 1500,
      type: 'transfer',
      createdAt: new Date('2024-01-04'),
    },
  ];

  const mockPrismaService = {
    transaction: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserTopTransactions', () => {
    it('should return top 10 transactions sorted by absolute amount', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getUserTopTransactions(mockUser);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ username: 'user1', amount: -5000 });
      expect(result[1]).toEqual({ username: 'user2', amount: 3000 });
      expect(result[2]).toEqual({ username: 'user3', amount: -2000 });
      expect(result[3]).toEqual({ username: 'user4', amount: 1500 });
    });

    it('should show debit transactions as negative amounts', async () => {
      const debitTx: Transaction[] = [
        {
          id: '1',
          fromUsername: 'testuser',
          toUsername: 'recipient',
          amount: 1000,
          type: 'transfer',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(debitTx);

      const result = await service.getUserTopTransactions(mockUser);

      expect(result[0]).toEqual({ username: 'recipient', amount: -1000 });
    });

    it('should show credit transactions as positive amounts', async () => {
      const creditTx: Transaction[] = [
        {
          id: '1',
          fromUsername: 'sender',
          toUsername: 'testuser',
          amount: 2000,
          type: 'transfer',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(creditTx);

      const result = await service.getUserTopTransactions(mockUser);

      expect(result[0]).toEqual({ username: 'sender', amount: 2000 });
    });

    it('should limit results to top 10 transactions', async () => {
      const manyTransactions: Transaction[] = Array.from(
        { length: 15 },
        (_, i) => ({
          id: `${i + 1}`,
          fromUsername: 'testuser',
          toUsername: `user${i}`,
          amount: 100 * (i + 1),
          type: 'transfer',
          createdAt: new Date(),
        }),
      );

      mockPrismaService.transaction.findMany.mockResolvedValue(
        manyTransactions,
      );

      const result = await service.getUserTopTransactions(mockUser);

      expect(result).toHaveLength(10);
    });

    it('should return empty array when user has no transactions', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getUserTopTransactions(mockUser);

      expect(result).toEqual([]);
    });

    it('should only include transfer type transactions', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      await service.getUserTopTransactions(mockUser);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { fromUsername: 'testuser' },
            { toUsername: 'testuser' },
          ],
          type: 'transfer',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should sort by absolute amount in descending order', async () => {
      const unsortedTx: Transaction[] = [
        {
          id: '1',
          fromUsername: 'testuser',
          toUsername: 'user1',
          amount: 100,
          type: 'transfer',
          createdAt: new Date(),
        },
        {
          id: '2',
          fromUsername: 'user2',
          toUsername: 'testuser',
          amount: 500,
          type: 'transfer',
          createdAt: new Date(),
        },
        {
          id: '3',
          fromUsername: 'testuser',
          toUsername: 'user3',
          amount: 300,
          type: 'transfer',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(unsortedTx);

      const result = await service.getUserTopTransactions(mockUser);

      expect(result[0].username).toBe('user2'); // 500
      expect(result[1].username).toBe('user3'); // 300
      expect(result[2].username).toBe('user1'); // 100
    });

    it('should handle decimal amounts', async () => {
      const decimalTx: Transaction[] = [
        {
          id: '1',
          fromUsername: 'testuser',
          toUsername: 'user1',
          amount: 123.45,
          type: 'transfer',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(decimalTx);

      const result = await service.getUserTopTransactions(mockUser);

      expect(result[0]).toEqual({ username: 'user1', amount: -123.45 });
    });
  });

  describe('getTopTransactingUsers', () => {
    it('should return top 10 users by total transacted amount', async () => {
      const mockGroupBy = [
        { fromUsername: 'user1', _sum: { amount: 10000 } },
        { fromUsername: 'user2', _sum: { amount: 8000 } },
        { fromUsername: 'user3', _sum: { amount: 5000 } },
      ];

      mockPrismaService.transaction.groupBy.mockResolvedValue(mockGroupBy);

      const result = await service.getTopTransactingUsers();

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        username: 'user1',
        transacted_value: 10000,
      });
      expect(result[1]).toEqual({
        username: 'user2',
        transacted_value: 8000,
      });
      expect(result[2]).toEqual({
        username: 'user3',
        transacted_value: 5000,
      });
    });

    it('should only include transfer type transactions', async () => {
      mockPrismaService.transaction.groupBy.mockResolvedValue([]);

      await service.getTopTransactingUsers();

      expect(mockPrismaService.transaction.groupBy).toHaveBeenCalledWith({
        by: ['fromUsername'],
        where: {
          type: 'transfer',
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 10,
      });
    });

    it('should limit results to 10 users', async () => {
      const manyUsers = Array.from({ length: 15 }, (_, i) => ({
        fromUsername: `user${i}`,
        _sum: { amount: 1000 * (15 - i) },
      }));

      mockPrismaService.transaction.groupBy.mockResolvedValue(
        manyUsers.slice(0, 10),
      );

      const result = await service.getTopTransactingUsers();

      expect(result).toHaveLength(10);
    });

    it('should handle null sum values', async () => {
      const mockGroupBy = [
        { fromUsername: 'user1', _sum: { amount: null } },
      ];

      mockPrismaService.transaction.groupBy.mockResolvedValue(mockGroupBy);

      const result = await service.getTopTransactingUsers();

      expect(result[0]).toEqual({ username: 'user1', transacted_value: 0 });
    });

    it('should return empty array when no transactions exist', async () => {
      mockPrismaService.transaction.groupBy.mockResolvedValue([]);

      const result = await service.getTopTransactingUsers();

      expect(result).toEqual([]);
    });

    it('should sort by total amount in descending order', async () => {
      const mockGroupBy = [
        { fromUsername: 'user1', _sum: { amount: 10000 } },
        { fromUsername: 'user2', _sum: { amount: 8000 } },
        { fromUsername: 'user3', _sum: { amount: 12000 } },
      ];

      // Simulating that Prisma already returns sorted data
      mockPrismaService.transaction.groupBy.mockResolvedValue(
        mockGroupBy.sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0)),
      );

      const result = await service.getTopTransactingUsers();

      expect(result[0].transacted_value).toBe(12000);
      expect(result[1].transacted_value).toBe(10000);
      expect(result[2].transacted_value).toBe(8000);
    });

    it('should handle decimal amounts', async () => {
      const mockGroupBy = [
        { fromUsername: 'user1', _sum: { amount: 1234.56 } },
      ];

      mockPrismaService.transaction.groupBy.mockResolvedValue(mockGroupBy);

      const result = await service.getTopTransactingUsers();

      expect(result[0]).toEqual({
        username: 'user1',
        transacted_value: 1234.56,
      });
    });
  });
});
