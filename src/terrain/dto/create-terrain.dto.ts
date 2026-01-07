import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Nested class for coordinates
class CoordinatesDto {
  @ApiProperty({ example: 30.0444, description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 31.2357, description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class CreateTerrainDto {
  @ApiProperty({
    example: '60c72b2f9b1e8b0015b3c3c7',
    description: "ID de l'Académie propriétaire du terrain",
  })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id_academie: string;

  @ApiProperty({
    example: 'Main Training Field',
    description: 'Nom du stade',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '123 Soccer Avenue, Cairo, Egypt',
    description: 'Localisation physique du terrain (adresse)',
  })
  @IsString()
  @IsNotEmpty()
  location_verbal: string;

  @ApiProperty({
    example: { latitude: 30.0444, longitude: 31.2357 },
    description: 'Coordonnées GPS du terrain',
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  coordinates: CoordinatesDto;

  @ApiProperty({
    example: 100,
    description: 'Capacité maximale de joueurs',
  })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({
    example: 3,
    description: 'Nombre de terrains disponibles',
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  number_of_fields: number;

  @ApiPropertyOptional({
    example: ['Field A', 'Field B', 'Field C'],
    description: 'Noms des terrains individuels',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  field_names?: string[];

  @ApiPropertyOptional({
    example: true,
    description: "Indique si le stade dispose d'éclairage pour les matchs de nuit",
  })
  @IsOptional()
  @IsBoolean()
  has_lights?: boolean;

  @ApiPropertyOptional({
    example: ['parking', 'bathrooms', 'cafe', 'locker rooms'],
    description: 'Liste des équipements disponibles',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Indique si le stade est disponible',
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}