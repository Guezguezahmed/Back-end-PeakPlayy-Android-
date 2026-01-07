// src/notifications/dto/update-notification.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiPropertyOptional({ example: true, description: 'Statut du message (true pour lu)' })
  @IsBoolean()
  @IsOptional()
  vue?: boolean;
}