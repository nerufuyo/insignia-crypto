import { ApiProperty } from '@nestjs/swagger';

export class UserTransactionDto {
  @ApiProperty({
    description:
      'Username of the transaction counterparty (sender or recipient)',
    example: 'alice_smith',
  })
  username: string;

  @ApiProperty({
    description:
      'Transaction amount (positive for credits, negative for debits)',
    example: -50000,
  })
  amount: number;
}
