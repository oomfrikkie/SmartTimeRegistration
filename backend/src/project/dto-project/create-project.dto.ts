import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Example Project', xml: { name: 'name' } })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, xml: { name: 'account_id' } })
  
  @IsInt()
  account_id: number;
}