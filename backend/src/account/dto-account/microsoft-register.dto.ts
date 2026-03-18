import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MicrosoftRegisterDto {
  @ApiProperty({ example: 'user@contoso.com', xml: { name: 'email' } })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe', required: false, xml: { name: 'name' } })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Doe', required: false, xml: { name: 'surname' } })
  @IsString()
  @IsOptional()
  surname?: string;
}