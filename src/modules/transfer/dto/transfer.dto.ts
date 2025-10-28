import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({
    description: 'Username of the recipient',
    example: 'jane_doe',
  })
  @IsString()
  @IsNotEmpty()
  to_username: string;

  @ApiProperty({
    description: 'Amount to transfer (must be positive)',
    example: 100000,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;
}
