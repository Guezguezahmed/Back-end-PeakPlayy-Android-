import { IsNotEmpty, IsMongoId, IsBoolean, IsOptional } from 'class-validator';

export class CreateInvitationArbitreDto {
  @IsNotEmpty()
  @IsMongoId()
  id_academie: string;

  @IsNotEmpty()
  @IsMongoId()
  id_arbitre: string;

  @IsOptional()
  @IsBoolean()
  vu?: boolean;
}
