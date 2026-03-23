import { ApiProperty } from '@nestjs/swagger';

export class AddEventDto {
  @ApiProperty({ example: 'Team Meeting' })
  name: string;

  @ApiProperty({ example: 'NHL Stenden', required: false })
  package_name?: string;

  @ApiProperty({ example: 'SmartTimeRegistration', required: false })
  project_name?: string;

  @ApiProperty({ example: '09:00:00' })
  start_time: string;

  @ApiProperty({ example: '10:30:00' })
  end_time: string;

  @ApiProperty({ example: '2026-03-11' })
  date: string;

  @ApiProperty({ example: 1.5 })
  total_hours: number;

  @ApiProperty({ example: 'Room 1012', required: false })
  location?: string;

  @ApiProperty({ example: 'Discuss sprint goals', required: false })
  description?: string;

  @ApiProperty({ example: false })
  is_online?: boolean;

  @ApiProperty({ example: false })
  is_series?: boolean;

  @ApiProperty({
    example: ['sara@example.com', 'felix@example.com'],
    required: false,
  })
  attendees?: string[];

  @ApiProperty({ example: 1 })
  account_id: number;
}
