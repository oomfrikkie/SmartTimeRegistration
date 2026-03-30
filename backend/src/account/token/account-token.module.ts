import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountToken } from './account-token.entity';
import { AccountTokenService } from './account-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountToken])],
  providers: [AccountTokenService],
  exports: [AccountTokenService],
})
export class AccountTokenModule {}
