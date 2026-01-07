// src/match/dto/create-match.dto.ts
import { IsString, IsNotEmpty, IsMongoId, IsDate, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Statut } from 'src/schemas/match.schema';

export class CreateMatchDto {
  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c1', description: 'ID du terrain' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id_terrain: string;

  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c2', description: 'ID de l’équipe 1' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id_equipe1: string;

  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c3', description: 'ID de l’équipe 2' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id_equipe2: string;

  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c4', description: 'ID de l’arbitre (User)' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id_arbitre: string;

  @ApiProperty({ 
    example: '2025-12-25T18:00:00Z', 
    description: 'Date et heure du match',
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ enum: Statut, default: Statut.PROGRAMME, description: 'Statut du match' })
  @IsEnum(Statut)
  @IsNotEmpty()
  statut: Statut;
}