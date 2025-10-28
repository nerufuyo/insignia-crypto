import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  to_username: string;

  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;
}
