import { ApiProperty } from '@nestjs/swagger';

export class ImportCalendarDto {
  @ApiProperty({ example: 'https://example.com/calendar.ics' })
  icsUrl: string;
}
