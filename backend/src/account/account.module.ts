import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from './account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MailerService } from './mailer.service';
import { AccountTokenModule } from './token/account-token.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), AccountTokenModule],
  controllers: [AccountController],
  providers: [AccountService, MailerService],
  exports: [AccountService],
})
export class AccountModule {}
