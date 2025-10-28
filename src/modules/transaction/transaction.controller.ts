import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UserTransactionDto } from './dto/user-transaction.dto';
import { TopUserDto } from './dto/top-user.dto';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('user/top')
  @HttpCode(HttpStatus.OK)
  async getUserTopTransactions(
    @CurrentUser() user: User,
  ): Promise<UserTransactionDto[]> {
    return this.transactionService.getUserTopTransactions(user);
  }

  @Get('top-users')
  @HttpCode(HttpStatus.OK)
  async getTopTransactingUsers(): Promise<TopUserDto[]> {
    return this.transactionService.getTopTransactingUsers();
  }
}
