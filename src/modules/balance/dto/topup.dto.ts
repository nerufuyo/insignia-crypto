import { IsNumber, IsPositive, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TopupDto {
  @ApiProperty({
    description: 'Amount to add to balance (must be positive, max 10,000,000)',
    example: 500000,
    minimum: 0.01,
    maximum: 10000000,
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  @Max(10000000, { message: 'Maximum top-up amount is 10,000,000' })
  amount: number;
}
