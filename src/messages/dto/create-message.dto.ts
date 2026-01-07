import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c7', description: 'ID de l’utilisateur émetteur' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId() // Checks if the string is a valid MongoDB ObjectId
  id_emetteur: string;

  @ApiProperty({ example: '60c72b2f9b1e8b0015b3c3c8', description: 'ID de l’utilisateur destinataire' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id_destinataire: string;

  @ApiProperty({ example: 'Bonjour, prêt pour le match de demain ?', description: 'Contenu du message' })
  @IsString()
  @IsNotEmpty()
  message: string;
}