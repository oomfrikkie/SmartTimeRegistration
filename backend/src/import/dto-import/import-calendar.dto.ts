import { ApiProperty } from '@nestjs/swagger';

export class ImportCalendarDto {
  @ApiProperty({ example: 'https://example.com/calendar.ics' })
  icsUrl: string;

  @ApiProperty({ example: '2026-01-01' })
  start_date: Date;

  @ApiProperty({ example: '2026-12-31' })
  end_date: Date;

  @ApiProperty({ example: 1 })
  account_id: number;
}
