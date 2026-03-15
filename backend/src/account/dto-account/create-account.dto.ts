import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'user@email.com', xml: { name: 'email' } })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Tom', xml: { name: 'name' } })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Miller', xml: { name: 'surname' } })
  @IsNotEmpty()
  surname: string;

  @ApiProperty({ example: 'strongpassword123', xml: { name: 'password' } })
  @MinLength(6)
  password: string;
}