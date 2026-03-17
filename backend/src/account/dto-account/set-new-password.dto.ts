import { IsString, MinLength } from 'class-validator';

export class SetNewPasswordDto {
  @IsString()
  token: string;

  @MinLength(6)
  password: string;
}