import { PartialType } from '@nestjs/mapped-types';
import { CreateInvitationArbitreDto } from './create-invitation_arbitre.dto';
export class UpdateInvitationArbitreDto extends PartialType(CreateInvitationArbitreDto) {}
