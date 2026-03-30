import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountTokenDto {
  @ApiProperty({ description: 'Token string' })
  token: string;

  @ApiProperty({ description: 'Token type (EMAIL_VERIFICATION or PASSWORD_RESET)' })
  token_type: string;

  @ApiProperty({ description: 'Expiration date of the token', type: String, format: 'date-time' })
  expires_at: Date;

  @ApiProperty({ description: 'Account ID associated with the token' })
  accountId: number;
}
