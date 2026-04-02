import { IsArray, IsNumber } from "class-validator";

export class SendInvitationDto {
  @IsNumber()
  projectId: number;

  @IsArray()
  inviteeIds: number[];
}