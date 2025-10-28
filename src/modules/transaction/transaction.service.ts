import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';
import { UserTransactionDto } from './dto/user-transaction.dto';
import { TopUserDto } from './dto/top-user.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async getUserTopTransactions(user: User): Promise<UserTransactionDto[]> {
    // Get all transactions where user is sender or receiver
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromUsername: user.username },
          { toUsername: user.username },
        ],
        type: 'transfer', // Only include transfers, not top-ups
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (transactions.length === 0) {
      return [];
    }

    // Transform transactions to show username and amount
    // Debits (outgoing) should be negative
    const formattedTransactions = transactions.map((tx) => {
      const isDebit = tx.fromUsername === user.username;
      const otherUsername = isDebit ? tx.toUsername : tx.fromUsername;
      const amount = isDebit ? -tx.amount : tx.amount;

      return {
        username: otherUsername,
        amount,
        absoluteAmount: Math.abs(amount),
      };
    });

    // Sort by absolute value in descending order
    formattedTransactions.sort((a, b) => b.absoluteAmount - a.absoluteAmount);

    // Return top 10, removing the absoluteAmount helper field
    return formattedTransactions.slice(0, 10).map(({ username, amount }) => ({
      username,
      amount,
    }));
  }

  async getTopTransactingUsers(): Promise<TopUserDto[]> {
    // Get all transfer transactions (debits only)
    const result = await this.prisma.transaction.groupBy({
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

    return result.map((item) => ({
      username: item.fromUsername,
      transacted_value: item._sum.amount || 0,
    }));
  }
}
