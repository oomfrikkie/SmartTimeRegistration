import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InvitationStatus, ProjectInvitation } from "./invitation.entity";
import { Repository } from "typeorm";
import { ProjectMember } from "src/projectmember/projectmember.entity";
import { MailerService } from "src/account/mailer.service";
import { ProjectMemberRole } from "src/projectmember/enum/projectmember.enum";

@Injectable()
export class InvitationService {
    constructor(
        @InjectRepository(ProjectInvitation)
        private invitationRepo: Repository<ProjectInvitation>,
        @InjectRepository(ProjectMember)
        private memberRepo: Repository<ProjectMember>,
        private mailerService: MailerService,
    ) {}

    async sendInvitations(projectId: number, inviteeIds: number[], inviterId: number) {
        console.log('sendInvitations called:', { projectId, inviteeIds, inviterId });
        const results: ProjectInvitation[] = [];
        
        for (const inviteeId of inviteeIds) {
        // Check if a memeber is already invited
        const existing = await this.invitationRepo.findOne({
            where: {
            project: { id: projectId },
            invitee: { id: inviteeId },
            status: InvitationStatus.PENDING,
            },
        });
        if (existing) continue;

        const invitation = this.invitationRepo.create({
            project: { id: projectId } as any,
            invitee: { id: inviteeId } as any,
            inviter: { id: inviterId } as any,
            status: InvitationStatus.PENDING,
        });
        await this.invitationRepo.save(invitation);
        results.push(invitation);
        }

        // Send emails — load full data for each invitation
        for (const inv of results) {
        const full = await this.invitationRepo.findOne({
            where: { id: inv.id },
            relations: ['project', 'invitee', 'inviter'],
        });
        if (!full) continue;
        await this.mailerService.sendInvitationEmail(
            full.invitee.email,
            full.invitee.name,
            full.inviter.name,
            full.project.name,
        );
        }

        return results;
    }

async getPendingForUser(userId: number) {
    return this.invitationRepo.find({
      where: { invitee: { id: userId }, status: InvitationStatus.PENDING },
      relations: ['project', 'inviter'],
      order: { created_at: 'DESC' },
    });
  }

  async accept(invitationId: number, userId: number) {
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId },
      relations: ['project', 'invitee'],
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.invitee.id !== userId) throw new ForbiddenException();

    invitation.status = InvitationStatus.ACCEPTED;
    await this.invitationRepo.save(invitation);

    // Add to project members as EMPLOYEE
    const member = this.memberRepo.create({
      project: invitation.project,
      account: invitation.invitee,
      roles: ProjectMemberRole.EMPLOYEE,
    });
    await this.memberRepo.save(member);

    return { message: 'Invitation accepted' };
  }

  async decline(invitationId: number, userId: number) {
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId },
      relations: ['invitee'],
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.invitee.id !== userId) throw new ForbiddenException();

    invitation.status = InvitationStatus.DECLINED;
    await this.invitationRepo.save(invitation);

    return { message: 'Invitation declined' };
  }
}