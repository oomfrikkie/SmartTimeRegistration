import { ApiProperty } from '@nestjs/swagger';

export class AccountTokenResponseDto {
  @ApiProperty()
  token_id: number;

  @ApiProperty()
  token: string;

  @ApiProperty()
  token_type: string;

  @ApiProperty({ type: String, format: 'date-time' })
  expires_at: Date;

  @ApiProperty()
  is_used: boolean;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  used_at?: Date;

  @ApiProperty()
  accountId: number;
}
