import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from './account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MailerService } from './mailer.service';
import { AccountTokenModule } from './token/account-token.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), AccountTokenModule, AuthModule],
  controllers: [AccountController],
  providers: [AccountService, MailerService],
  exports: [AccountService],
})
export class AccountModule {}
