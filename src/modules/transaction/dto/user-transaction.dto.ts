import { ApiProperty } from '@nestjs/swagger';

export class UserTransactionDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'clxxxx123',
  })
  id: string;

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

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2025-10-29T11:00:00.000Z',
  })
  created_at: string;
}
