import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInvitation } from './invitation.entity';
import { ProjectMember } from '../projectmember/projectmember.entity';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { MailerService } from '../account/mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectInvitation, ProjectMember])],
  providers: [InvitationService, MailerService],
  controllers: [InvitationController],
})
export class InvitationModule {}