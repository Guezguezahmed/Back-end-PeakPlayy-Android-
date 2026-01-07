// src/coupe/dto/update-coupe.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCoupeDto } from './create-coupe.dto';
import { IsOptional, IsEnum, IsMongoId, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CoupeCategorie, CoupeType } from 'src/schemas/coupe.schema';


export class UpdateCoupeDto extends PartialType(CreateCoupeDto) {
  @ApiPropertyOptional({ enum: CoupeCategorie, example: CoupeCategorie.YOUTH, description: 'Catégorie de la Coupe' })
  @IsEnum(CoupeCategorie)
  @IsOptional()
  categorie?: CoupeCategorie;

  @ApiPropertyOptional({ enum: CoupeType, example: CoupeType.TOURNAMENT, description: 'Type de la Coupe' })
  @IsEnum(CoupeType)
  @IsOptional()
  type?: CoupeType;

  @ApiPropertyOptional({ example: '60c72b2f9b1e8b0015b3c3c1', description: 'ID de l’équipe déclarée vainqueur' })
  @IsMongoId()
  @IsOptional()
  id_vainqueur?: string;

  @ApiPropertyOptional({ example: ['65d87a1e943dc67875432b8e'], description: 'IDs des arbitres' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  referee?: string[];

  @ApiPropertyOptional({ example: 50, description: 'Frais d’inscription (optionnel)' })
  @IsOptional()
  entryFee?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Prize pool/lot (optionnel)' })
  @IsOptional()
  prizePool?: number;
}

// DTO for adding/removing a single participant
export class UpdateCoupeParticipantsDto {
    @ApiPropertyOptional({ 
        example: '60c72b2f9b1e8b0015b3c3c9', 
        description: 'ID de l’équipe à ajouter ou retirer',
    })
    @IsMongoId()
    @IsString()
    teamId: string;
}