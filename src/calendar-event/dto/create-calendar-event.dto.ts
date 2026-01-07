import { IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateCalendarEventDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsDateString()
    @IsNotEmpty()
    date: string; // ISO 8601 format: "2026-01-14"

    @IsString()
    @IsNotEmpty()
    startTime: string; // Format: "HH:mm"

    @IsString()
    @IsOptional()
    endTime?: string; // Format: "HH:mm"

    @IsString()
    @IsOptional()
    color?: string; // Hex color

    @IsString()
    @IsOptional()
    type?: string; // Custom event type

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateCalendarEventDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsOptional()
    startTime?: string;

    @IsString()
    @IsOptional()
    endTime?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    type?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
