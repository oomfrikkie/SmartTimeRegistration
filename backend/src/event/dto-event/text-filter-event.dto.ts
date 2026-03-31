import { ApiProperty } from '@nestjs/swagger';

export class TextFilterEventDto {
  @ApiProperty({ example: 1, required: true })
  account_id: number;

  @ApiProperty({ example: 'SmartTimeRegistration', required: true })
  project_name?: string;
}