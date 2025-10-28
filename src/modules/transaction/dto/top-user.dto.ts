import { ApiProperty } from '@nestjs/swagger';

export class TopUserDto {
  @ApiProperty({
    description: 'Username of the transacting user',
    example: 'bob_jones',
  })
  username: string;

  @ApiProperty({
    description: 'Total value of outbound transfers',
    example: 2500000,
  })
  transacted_value: number;
}
