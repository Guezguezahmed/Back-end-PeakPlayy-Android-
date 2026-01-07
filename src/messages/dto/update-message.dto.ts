import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @ApiPropertyOptional({ example: true, description: 'Statut du message (lu/non lu)' })
  @IsBoolean()
  @IsOptional()
  vue?: boolean;

  @ApiPropertyOptional({ example: 'Message corrigé...', description: 'Nouveau contenu du message' })
  @IsString()
  @IsOptional()
  message?: string;
}