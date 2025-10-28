import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferDto } from './dto/transfer.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('transfer')
@UseGuards(AuthGuard)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async transfer(
    @CurrentUser() user: User,
    @Body() transferDto: TransferDto,
  ): Promise<{ message: string }> {
    return this.transferService.transfer(user, transferDto);
  }
}
