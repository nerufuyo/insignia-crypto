import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UserTransactionDto } from './dto/user-transaction.dto';
import { TopUserDto } from './dto/top-user.dto';

@ApiTags('Transaction')
@ApiBearerAuth('access-token')
@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('user/top')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get top 10 user transactions',
    description:
      'Returns the top 10 transactions for authenticated user, sorted by absolute value. Debits are shown as negative amounts',
  })
  @ApiResponse({
    status: 200,
    description: 'Top transactions retrieved successfully',
    type: [UserTransactionDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getUserTopTransactions(
    @CurrentUser() user: User,
  ): Promise<UserTransactionDto[]> {
    return this.transactionService.getUserTopTransactions(user);
  }

  @Get('top-users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get top 10 transacting users',
    description:
      'Returns top 10 users ranked by total outbound transfer volume (highest to lowest)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top users retrieved successfully',
    type: [TopUserDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getTopTransactingUsers(): Promise<TopUserDto[]> {
    return this.transactionService.getTopTransactingUsers();
  }
}
