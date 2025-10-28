import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TopupDto } from './dto/topup.dto';
import { User } from '@prisma/client';

@Injectable()
export class BalanceService {
  constructor(private prisma: PrismaService) {}

  async topup(user: User, topupDto: TopupDto): Promise<{ message: string }> {
    const { amount } = topupDto;

    // Update user balance and create transaction in a single transaction
    await this.prisma.$transaction(async (prisma) => {
      // Update user balance
      await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          fromUsername: user.username,
          toUsername: user.username,
          amount,
          type: 'topup',
        },
      });
    });

    return { message: 'Top-up successful' };
  }

  async getBalance(user: User): Promise<{ balance: number }> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    return { balance: currentUser.balance };
  }
}
