// src/equipe/dto/create-equipe.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsArray, IsMongoId, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Categorie } from 'src/schemas/equipe.schema';

export class CreateEquipeDto {

    @ApiPropertyOptional({ example: '60c72b2f9b1e8b0015b3c3c9', description: "ID de l'entraîneur (coach) responsable de l'équipe" })
    @IsString()
    @IsOptional()
    id_coach?: string;
  @ApiProperty({ example: '674123456789abcdef012345', description: 'ID de l\'académie (OWNER)' })
  @IsMongoId()
  @IsNotEmpty()
  id_academie: string;

  @ApiProperty({ example: 'Les Lions de Tunis', description: 'Nom de l\'équipe' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'URL du logo de l\'équipe' })
  @IsString()
  @IsOptional()
  logo?: string;

  // Members can be optionally added during creation, or added later
  @ApiPropertyOptional({
    example: ['60c72b2f9b1e8b0015b3c3c7', '60c72b2f9b1e8b0015b3c3c8'],
    description: 'Liste des IDs des joueurs (Users) membres de l\'équipe',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  // Starting lineup (subset of members)
  @ApiPropertyOptional({
    example: ['60c72b2f9b1e8b0015b3c3c7'],
    description: 'Liste des IDs des joueurs titulaires',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  starters?: string[];

  // Substitute players (subset of members)
  @ApiPropertyOptional({
    example: ['60c72b2f9b1e8b0015b3c3c8'],
    description: 'Liste des IDs des joueurs remplaçants',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  substitutes?: string[];

  @ApiProperty({ example: Categorie.SENIOR, enum: Categorie, description: 'Catégorie de l\'équipe' })
  @IsEnum(Categorie)
  @IsNotEmpty()
  categorie: Categorie;

  @ApiPropertyOptional({ example: 'Équipe senior masculine de l\'académie', description: 'Description de l\'équipe' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Statut actif de l\'équipe' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}