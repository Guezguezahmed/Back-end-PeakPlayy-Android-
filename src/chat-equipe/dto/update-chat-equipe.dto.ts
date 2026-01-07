// src/chat-equipe/dto/update-chat-equipe.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateChatEquipeDto } from './create-chat-equipe.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChatEquipeDto extends PartialType(CreateChatEquipeDto) {
  @ApiPropertyOptional({ example: true, description: 'Statut du message (true pour lu)' })
  @IsBoolean()
  @IsOptional()
  vue?: boolean;

  @ApiPropertyOptional({ example: 'Correction: le match est demain !', description: 'Nouveau contenu du message' })
  @IsString()
  @IsOptional()
  message?: string;
}