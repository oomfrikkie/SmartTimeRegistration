import { Body, Controller, Get, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { SendInvitationDto } from "./dto-invitation/send-invitation.dto";
import { InvitationService } from "./invitation.service";
import type { Request } from 'express';
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
@Controller('invitation')
@UseGuards(JwtAuthGuard)
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('send')
  async send(@Body() dto: SendInvitationDto, @Req() req: any) {
    return this.invitationService.sendInvitations(dto.projectId, dto.inviteeIds, req.user.id);
  }

  @Get('pending')
  async getPending(@Req() req: any) {
    return this.invitationService.getPendingForUser(req.user.id);
  }

  @Patch(':id/accept')
  async accept(@Param('id') id: string, @Req() req: any) {
    return this.invitationService.accept(Number(id), req.user.id);
  }

  @Patch(':id/decline')
  async decline(@Param('id') id: string, @Req() req: any) {
    return this.invitationService.decline(Number(id), req.user.id);
  }
}