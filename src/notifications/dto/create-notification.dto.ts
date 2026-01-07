// src/notifications/dto/create-notification.dto.ts
import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiPropertyOptional({ 
    example: '60c72b2f9b1e8b0015b3c3c7', 
    description: 'ID de l’utilisateur émetteur (facultatif, si c\'est le système)',
  })
  @IsString()
  @IsOptional()
  @IsMongoId() 
  id_emetteur?: string;

  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c8', description: 'ID de l’utilisateur destinataire' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id_destinataire: string;

  @ApiProperty({ example: 'Votre match a été programmé pour demain à 19h.', description: 'Contenu de la notification' })
  @IsString()
  @IsNotEmpty()
  message: string;
}