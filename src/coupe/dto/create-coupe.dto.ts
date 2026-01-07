// src/coupe/dto/create-coupe.dto.ts
import { IsString, IsNotEmpty, IsMongoId, IsDate, IsArray, ArrayMinSize, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CoupeCategorie, CoupeType } from 'src/schemas/coupe.schema';

export class CreateCoupeDto {
  @ApiProperty({ example: 'Coupe d\'Hiver 2025', description: 'Nom de la compétition' })
  @IsString()
  @IsNotEmpty()
  nom: string;
  
  // Retiré : id_organisateur est auto-attribué côté serveur (OWNER JWT)
  
  @ApiPropertyOptional({ 
    example: ['60c72b2f9b1e8b0015b3c3c1', '60c72b2f9b1e8b0015b3c3c2'], 
    description: 'Liste des IDs des équipes participantes',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  participants?: string[];

  @ApiProperty({ example: '2025-01-01T08:00:00Z', description: 'Date de début de la compétition' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date_debut: Date;

  @ApiProperty({ example: '2025-01-31T22:00:00Z', description: 'Date de fin prévue de la compétition' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date_fin: Date;

  // --- NEW FIELDS ---

  @ApiProperty({ example: 'Tournoi Nationale Juniors', description: 'Nom du tournoi associé à cette coupe' })
  @IsString()
  @IsNotEmpty()
  tournamentName: string;

  @ApiProperty({ example: 'Stade Olympique', description: 'Stade où se déroule la coupe' })
  @IsString()
  @IsNotEmpty()
  stadium: string;

  @ApiProperty({ example: '2025-01-01', description: 'Date du tournoi au format mm/dd/yyyy (saisir en yyyy-mm-dd)' })
  @IsString()
  @IsNotEmpty()
  date: string; // ISO string or yyyy-mm-dd for best compatibility

  @ApiProperty({ example: '14:00', description: "Heure du tournoi (format '--:--')" })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 32, description: 'Nombre maximum de participants' })
  @IsNotEmpty()
  maxParticipants: number;

  @ApiPropertyOptional({ example: 50, description: 'Frais d’inscription (optionnel)' })
  @IsOptional()
  entryFee?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Prize pool/lot (optionnel)' })
  @IsOptional()
  prizePool?: number;

  @ApiProperty({ example: ['65d87a1e943dc67875432b8e'], description: 'Liste des IDs des arbitres (users avec rôle ARBITRE)' })
  @IsArray()
  @IsString({ each: true })
  referee: string[];
  
  @ApiProperty({ enum: CoupeCategorie, example: CoupeCategorie.YOUTH, description: 'Catégorie de la Coupe' })
  @IsEnum(CoupeCategorie)
  categorie: CoupeCategorie;

  @ApiProperty({ enum: CoupeType, example: CoupeType.TOURNAMENT, description: 'Type de la Coupe' })
  @IsEnum(CoupeType)
  type: CoupeType;
}