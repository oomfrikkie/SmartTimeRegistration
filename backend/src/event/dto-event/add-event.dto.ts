import { ApiProperty } from '@nestjs/swagger';

export class AddEventDto {
  @ApiProperty({ example: 'Team Meeting' })
  name: string;

  @ApiProperty({ example: '09:00:00' })
  start_time: string;

  @ApiProperty({ example: '10:30:00' })
  end_time: string;

  @ApiProperty({ example: '2026-03-11' })
  date: string;

  @ApiProperty({ example: 1.5 })
  total_hours: number;

  @ApiProperty({ example: 1 })
  account_id: number;
}
