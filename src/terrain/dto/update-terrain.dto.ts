import { PartialType } from '@nestjs/mapped-types';
import { CreateTerrainDto } from './create-terrain.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

// PartialType makes all properties from CreateTerrainDto optional
export class UpdateTerrainDto extends PartialType(CreateTerrainDto) {
    // No new properties needed, just making the existing ones optional.
}