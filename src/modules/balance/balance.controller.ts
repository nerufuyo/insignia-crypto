import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { TopupDto } from './dto/topup.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('balance')
@UseGuards(AuthGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('topup')
  @HttpCode(HttpStatus.CREATED)
  async topup(
    @CurrentUser() user: User,
    @Body() topupDto: TopupDto,
  ): Promise<{ message: string }> {
    return this.balanceService.topup(user, topupDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBalance(@CurrentUser() user: User): Promise<{ balance: number }> {
    return this.balanceService.getBalance(user);
  }
}
