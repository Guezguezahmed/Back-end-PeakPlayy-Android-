// src/chat-equipe/dto/create-chat-equipe.dto.ts
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatEquipeDto {
  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c9', description: 'ID de l’équipe cible' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id_equipe: string;

  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c7', description: 'ID de l’utilisateur émetteur' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId() 
  id_emetteur: string;

  @ApiProperty({ example: 'Qui a les maillots pour le match de ce soir ?', description: 'Contenu du message' })
  @IsString()
  @IsNotEmpty()
  message: string;
}