// src/schemas/stats-equipe.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Tournament placement sub-schema
@Schema({ _id: false })
export class TournamentPlacement {
  @Prop({ required: true })
  tournament_id: string;

  @Prop({ required: true })
  tournament_name: string;

  @Prop({ required: true })
  placement: number; // 1 = winner, 2 = runner-up, etc.

  @Prop({ required: true })
  season: string; // e.g., "2024-2025"

  @Prop({ required: true })
  date: Date;
}

export const TournamentPlacementSchema = SchemaFactory.createForClass(TournamentPlacement);

// Last 5 matches for form calculation
@Schema({ _id: false })
export class RecentMatch {
  @Prop({ required: true, enum: ['W', 'D', 'L'] })
  result: string; // Win, Draw, Loss

  @Prop({ required: true })
  date: Date;
}

export const RecentMatchSchema = SchemaFactory.createForClass(RecentMatch);

@Schema({ _id: false }) // Use _id: false to prevent Mongoose from creating an extra ID field
export class StatsEquipe {
  // ===== MATCH RESULTS ===== //
  @Prop({ default: 0 })
  total_matches: number;

  @Prop({ default: 0 })
  wins: number;

  @Prop({ default: 0 })
  draws: number;

  @Prop({ default: 0 })
  losses: number;

  // ===== GOALS ===== //
  @Prop({ default: 0 })
  goals_for: number; // Total goals scored

  @Prop({ default: 0 })
  goals_against: number; // Total goals conceded

  // ===== STREAKS ===== //
  @Prop({ default: 0 })
  current_win_streak: number;

  @Prop({ default: 0 })
  best_win_streak: number;

  @Prop({ default: 0 })
  current_loss_streak: number;

  @Prop({ default: 0 })
  best_loss_streak: number;

  // ===== TROPHIES & RANKINGS ===== //
  @Prop({ default: 0 })
  trophies_won: number; // Tournament victories (1st place)

  @Prop({ default: 0 })
  runners_up: number; // 2nd place finishes

  @Prop({ default: 0 })
  third_place: number; // 3rd place finishes

  @Prop({ type: [TournamentPlacementSchema], default: [] })
  tournament_history: TournamentPlacement[];

  // ===== FORM & MOMENTUM ===== //
  @Prop({ type: [RecentMatchSchema], default: [] })
  last_five_matches: RecentMatch[]; // Store last 5 results for form calculation

  // ===== DISCIPLINE ===== //
  @Prop({ default: 0 })
  total_yellow_cards: number;

  @Prop({ default: 0 })
  total_red_cards: number;

  // ===== ADDITIONAL USEFUL STATS ===== //
  @Prop({ default: 0 })
  home_wins: number;

  @Prop({ default: 0 })
  away_wins: number;

  @Prop({ default: 0 })
  clean_sheets: number; // Matches without conceding

  // ===== TEAM RATING ===== //
  @Prop({ required: false, min: 1, max: 5, default: 2.5, type: Number })
  rating?: number; // Team overall rating (1-5 stars)

  @Prop({ type: Date })
  last_match_date?: Date;

  @Prop({ type: Date })
  last_win_date?: Date;
}

export const StatsEquipeSchema = SchemaFactory.createForClass(StatsEquipe);