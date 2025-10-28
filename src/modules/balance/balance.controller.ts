import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { TopupDto } from './dto/topup.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Balance')
@ApiBearerAuth('access-token')
@Controller('balance')
@UseGuards(AuthGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('topup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Top up user balance',
    description:
      'Adds funds to the user balance. Amount must be positive and cannot exceed 10,000,000',
  })
  @ApiBody({ type: TopupDto })
  @ApiResponse({
    status: 201,
    description: 'Balance topped up successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Top up successful. New balance: 1000000',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid amount or exceeds maximum',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async topup(
    @CurrentUser() user: User,
    @Body() topupDto: TopupDto,
  ): Promise<{ message: string }> {
    return this.balanceService.topup(user, topupDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user balance',
    description: 'Retrieves the current balance for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    type: BalanceResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getBalance(@CurrentUser() user: User): Promise<{ balance: number }> {
    return this.balanceService.getBalance(user);
  }
}
