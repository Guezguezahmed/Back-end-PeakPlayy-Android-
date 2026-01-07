// create-staff.dto.ts
import { IsNotEmpty, IsMongoId, IsArray } from 'class-validator';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsMongoId()
  id_academie: string;

  @IsArray()
  @IsMongoId({ each: true })
  id_arbitres: string[];

  @IsArray()
  @IsMongoId({ each: true })
  id_coaches: string[];
}
