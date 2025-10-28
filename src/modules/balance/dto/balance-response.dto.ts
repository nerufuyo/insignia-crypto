import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({
    description: 'Current balance of the user',
    example: 1500000,
  })
  balance: number;
}
