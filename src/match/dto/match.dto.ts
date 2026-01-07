import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateMatchEventDto {
    @IsString()
    @IsNotEmpty()
    matchId: string;

    @IsString()
    @IsNotEmpty()
    type: string; // "GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"

    @IsString()
    @IsNotEmpty()
    teamId: string;

    @IsString()
    @IsOptional()
    playerId?: string;

    @IsString()
    @IsOptional()
    playerName?: string;

    @IsNumber()
    @IsNotEmpty()
    minute: number;

    @IsString()
    @IsNotEmpty()
    half: string; // "FIRST_HALF", "SECOND_HALF"

    // For goals - assist
    @IsString()
    @IsOptional()
    assistPlayerId?: string;

    @IsString()
    @IsOptional()
    assistPlayerName?: string;

    // For substitutions
    @IsString()
    @IsOptional()
    playerOutId?: string;

    @IsString()
    @IsOptional()
    playerOutName?: string;

    @IsString()
    @IsOptional()
    playerInId?: string;

    @IsString()
    @IsOptional()
    playerInName?: string;
}

export class UpdateMatchStatusDto {
    @IsString()
    @IsNotEmpty()
    matchStatus: string;

    @IsNumber()
    @IsOptional()
    currentMinute?: number;

    @IsString()
    @IsOptional()
    currentHalf?: string;
}

export class UpdateMatchScoreDto {
    @IsNumber()
    @IsOptional()
    score_eq1?: number;

    @IsNumber()
    @IsOptional()
    score_eq2?: number;
}

export class UpdateMatchStatisticsDto {
    @IsString()
    @IsNotEmpty()
    teamId: string;

    @IsNumber()
    @IsOptional()
    possession?: number;

    @IsNumber()
    @IsOptional()
    shots?: number;

    @IsNumber()
    @IsOptional()
    shotsOnTarget?: number;

    @IsNumber()
    @IsOptional()
    corners?: number;

    @IsNumber()
    @IsOptional()
    fouls?: number;
}
