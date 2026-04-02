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
    example: '01-01-2026', 
    required: false,
    type: String,
    description: 'Start date of the project (DD-MM-YYYY)'
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ 
    example: '12-12-2026', 
    required: false,
    type: String,
    description: 'End date of the project (DD-MM-YYYY)'
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ValidateIf((o) => o.startDate && o.endDate)
  validateEndDate?(o: CreateProjectDto) {
    if (o.endDate && o.startDate && o.endDate < o.startDate) {
      throw new Error('End date cannot be before start date');
    }
  }
  endDate?: Date;
}