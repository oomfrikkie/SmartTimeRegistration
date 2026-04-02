import { Body, Controller, Get, Param, Patch, Post, Req, UnauthorizedException } from "@nestjs/common";
import { SendInvitationDto } from "./dto-invitation/send-invitation.dto";
import { InvitationService } from "./invitation.service";
import type { Request } from 'express';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('send')
  async send(@Body() dto: SendInvitationDto, @Req() req: Request) {
    const userId = (req.session as any).userId;
    if (!userId) throw new UnauthorizedException();
    return this.invitationService.sendInvitations(dto.projectId, dto.inviteeIds, userId);
  }

  @Get('pending')
  async getPending(@Req() req: Request) {
    const userId = (req.session as any).userId;
    if (!userId) throw new UnauthorizedException();
    return this.invitationService.getPendingForUser(userId);
  }

  @Patch(':id/accept')
  async accept(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.session as any).userId;
    if (!userId) throw new UnauthorizedException();
    return this.invitationService.accept(Number(id), userId);
  }

  @Patch(':id/decline')
  async decline(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.session as any).userId;
    if (!userId) throw new UnauthorizedException();
    return this.invitationService.decline(Number(id), userId);
  }
}