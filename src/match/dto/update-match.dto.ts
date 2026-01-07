// src/match/dto/update-match.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchDto } from './create-match.dto';
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Statut } from 'src/schemas/match.schema';

export class UpdateMatchDto extends PartialType(CreateMatchDto) {
  @ApiPropertyOptional({ example: 3, description: 'Score final de l’équipe 1' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  score_eq1?: number;

  @ApiPropertyOptional({ example: 1, description: 'Score final de l’équipe 2' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  score_eq2?: number;

  @ApiPropertyOptional({ enum: Statut, example: Statut.TERMINE, description: 'Nouveau statut du match' })
  @IsEnum(Statut)
  @IsOptional()
  statut?: Statut;
}