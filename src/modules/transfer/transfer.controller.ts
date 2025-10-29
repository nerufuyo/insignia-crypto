import {
  Controller,
  Post,
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
import { TransferService } from './transfer.service';
import { TransferDto } from './dto/transfer.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Transfer')
@ApiBearerAuth('access-token')
@Controller('transfer')
@UseGuards(AuthGuard)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transfer balance to another user',
    description:
      'Transfers funds from authenticated user to another user. Validates sufficient balance and recipient existence',
  })
  @ApiBody({ type: TransferDto })
  @ApiResponse({
    status: 200,
    description: 'Transfer completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Transfer successful' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Insufficient balance or self-transfer attempt',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Recipient user does not exist',
  })
  async transfer(
    @CurrentUser() user: User,
    @Body() transferDto: TransferDto,
  ): Promise<{ message: string }> {
    return this.transferService.transfer(user, transferDto);
  }
}
