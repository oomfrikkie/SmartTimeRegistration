import { ApiProperty } from '@nestjs/swagger';

export class AccountDto {
  @ApiProperty({ example: 1, xml: { name: 'id' } })
  id: number;

  @ApiProperty({ example: 'user@email.com', xml: { name: 'email' } })
  email: string;

  @ApiProperty({ example: 'Tom', xml: { name: 'name' } })
  name: string;

  @ApiProperty({ example: 'Miller', xml: { name: 'surname' } })
  surname: string;
}