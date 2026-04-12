import { IsArray, IsNumber, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class InviteeWithHoursDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  assigned_hours?: number;
}

export class SendInvitationDto {
  @IsNumber()
  projectId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteeWithHoursDto)
  invitees: InviteeWithHoursDto[];
}