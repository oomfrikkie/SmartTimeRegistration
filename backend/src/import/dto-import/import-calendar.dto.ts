import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsDateString, IsInt } from 'class-validator';

export class ImportCalendarDto {

  @ApiProperty({ example: 'https://example.com/calendar.ics' })
  @IsString()
  @IsUrl()
  icsUrl!: string;


  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  start_date!: string;


  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  end_date!: string;


  @ApiProperty({ example: 1 })
  @IsInt()
  account_id!: number;
}
