import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUserDto {
  @ApiProperty({ example: 1, description: 'ID of the project' })
  @IsInt()
  @IsNotEmpty()
  project_id: number;

  @ApiProperty({ example: 2, description: 'ID of the account to add' })
  @IsInt()
  @IsNotEmpty()
  account_id: number;
}