import { IsInt, IsNotEmpty, IsString, IsEnum, IsOptional, IsDate, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../project.entity';
import { Type } from 'class-transformer';
 
export class CreateProjectDto {
  @ApiProperty({ example: 'Example Project', xml: { name: 'name' } })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, xml: { name: 'account_id' } })
  @IsInt()
  account_id: number;

  @ApiProperty({ 
    enum: ProjectStatus, 
    example: ProjectStatus.ONGOING,
    required: false,
    default: ProjectStatus.ONGOING
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ 
    example: '2026-01-01', 
    required: false,
    type: String,
    description: 'Start date of the project (YYYY-MM-DD)'
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ 
    example: '2026-08-24', 
    required: false,
    type: String,
    description: 'End date of the project (YYYY-MM-DD)'
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}