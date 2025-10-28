import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransferDto } from './dto/transfer.dto';
import type { User } from '@prisma/client';

@Injectable()
export class TransferService {
  constructor(private prisma: PrismaService) {}

  async transfer(sender: User, transferDto: TransferDto): Promise<{ message: string }> {
    const { to_username, amount } = transferDto;

    // Prevent self-transfer
    if (sender.username === to_username) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Check if amount is valid
    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be positive');
    }

    // Check if sender has sufficient balance
    if (sender.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Check if recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { username: to_username },
    });

    if (!recipient) {
      throw new NotFoundException(`User '${to_username}' not found`);
    }

    // Perform transfer in a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Deduct from sender
      await prisma.user.update({
        where: { id: sender.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Add to recipient
      await prisma.user.update({
        where: { id: recipient.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          fromUsername: sender.username,
          toUsername: to_username,
          amount,
          type: 'transfer',
        },
      });
    });

    return { message: 'Transfer successful' };
  }
}
