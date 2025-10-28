import { IsNumber, IsPositive, Max } from 'class-validator';

export class TopupDto {
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  @Max(10000000, { message: 'Maximum top-up amount is 10,000,000' })
  amount: number;
}
