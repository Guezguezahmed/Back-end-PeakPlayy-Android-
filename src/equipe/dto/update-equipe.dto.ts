// src/equipe/dto/update-equipe.dto.ts
import { IsString, IsOptional, IsMongoId, IsArray, IsNotEmpty, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Categorie } from 'src/schemas/equipe.schema';

export class UpdateEquipeDto {

        @ApiPropertyOptional({ example: '60c72b2f9b1e8b0015b3c3c9', description: "Nouvel ID du coach (User)" })
        @IsString()
        @IsOptional()
        id_coach?: string;
    @ApiPropertyOptional({ example: 'Nouveau Nom', description: 'Nouveau nom de l\'équipe' })
    @IsString()
    @IsOptional()
    nom?: string;

    @ApiPropertyOptional({ example: 'https://example.com/new-logo.png', description: 'URL du logo de l\'équipe' })
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiPropertyOptional({
        example: ['60c72b2f9b1e8b0015b3c3c7', '60c72b2f9b1e8b0015b3c3c8'],
        description: 'Liste complète des membres de l\'équipe',
        type: [String],
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    members?: string[];

    @ApiPropertyOptional({
        example: ['60c72b2f9b1e8b0015b3c3c7'],
        description: 'Liste des joueurs titulaires',
        type: [String],
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    starters?: string[];

    @ApiPropertyOptional({
        example: ['60c72b2f9b1e8b0015b3c3c8'],
        description: 'Liste des joueurs remplaçants',
        type: [String],
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    substitutes?: string[];

    @ApiPropertyOptional({ example: Categorie.SENIOR, enum: Categorie, description: 'Catégorie de l\'équipe' })
    @IsEnum(Categorie)
    @IsOptional()
    categorie?: Categorie;

    @ApiPropertyOptional({ example: 'Équipe senior masculine de l\'académie', description: 'Description de l\'équipe' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: true, description: 'Statut actif de l\'équipe' })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

// DTO for adding/removing a single player
export class UpdateTeamMembersDto {
    @ApiPropertyOptional({
        example: '60c72b2f9b1e8b0015b3c3c9',
        description: 'ID du joueur à ajouter ou retirer',
    })
    @IsMongoId()
    @IsNotEmpty()
    playerId: string;
}