// src/schemas/match.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export enum Statut {
  PROGRAMME = 'PROGRAMME',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
}

@Schema({ timestamps: true })
export class Match {

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Equipe', required: false })
  id_equipe1: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Equipe', required: false })
  id_equipe2: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Terrain', required: false })
  id_terrain?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: false })
  id_arbitre?: mongoose.Types.ObjectId;

  // Details
  @Prop({ required: true })
  date: Date;

  // Scores
  @Prop({ default: 0 })
  score_eq1: number;

  @Prop({ default: 0 })
  score_eq2: number;

  statut: Statut;


  // ===== TOURNAMENT BRACKET FIELDS ===== //
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Coupe', required: false })
  coupeId?: mongoose.Types.ObjectId;

  @Prop({ required: false })
  roundName: string; // "Quarter Finals", "Semi Finals", "Final"

  @Prop({ required: false })
  roundNumber: number; // 1, 2, 3

  @Prop({ required: false })
  matchNumber: number; // Position within the round

  @Prop({ required: true })
  round: number;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Match', default: null })
  nextMatch?: mongoose.Types.ObjectId;

  @Prop({ enum: ['eq1', 'eq2'], default: 'eq1' })
  positionInNextMatch: 'eq1' | 'eq2';

  // Match status for live tracking
  @Prop({ default: 'SCHEDULED' })
  matchStatus: string; // "SCHEDULED", "FIRST_HALF", "HALF_TIME", "SECOND_HALF", "FULL_TIME", "COMPLETED"

  @Prop({ default: 0 })
  currentMinute: number;

  @Prop({ required: false })
  currentHalf: string; // "FIRST_HALF", "SECOND_HALF"

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Equipe', required: false })
  winnerId?: mongoose.Types.ObjectId;

  // ===== CARDS (Split by Team) ===== //
  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  cartonJaune_eq1: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  cartonJaune_eq2: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  cartonRouge_eq1: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  cartonRouge_eq2: mongoose.Types.ObjectId[];

  // ===== LEGACY CARD ARRAYS (Deprecated - keeping for backward compatibility) ===== //
  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  cartonJaune: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  cartonRouge: mongoose.Types.ObjectId[];

  // ===== GOALS & ASSISTS ===== //
  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  But_eq1: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  But_eq2: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  assist_eq1: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  assist_eq2: mongoose.Types.ObjectId[];



  // ===== MATCH STATISTICS (Counts) ===== //
  @Prop({ default: 0 })
  offside_eq1: number;

  @Prop({ default: 0 })
  offside_eq2: number;

  @Prop({ default: 0 })
  corner_eq1: number;

  @Prop({ default: 0 })
  corner_eq2: number;

  @Prop({ default: 0 })
  penalty_eq1: number;

  @Prop({ default: 0 })
  penalty_eq2: number;

  // ===== PENALTY SHOOTOUT ===== //
  @Prop({ default: false })
  hasPenaltyShootout: boolean;

  @Prop({ default: 0 })
  penaltyScore_eq1: number;

  @Prop({ default: 0 })
  penaltyScore_eq2: number;

  // ===== MATCH METADATA ===== //
  @Prop({ default: false })
  isOfficiated: boolean; // True if referee used app to track events

  @Prop({ default: false })
  scoresCalculatedFromEvents: boolean; // True if scores derived from events
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Virtual field: Derive 'statut' from 'matchStatus'
MatchSchema.virtual('statut')
  .get(function () {
    switch (this.matchStatus) {
      case 'SCHEDULED':
        return 'PROGRAMME';
      case 'FIRST_HALF':
      case 'HALF_TIME':
      case 'SECOND_HALF':
        return 'EN_COURS';
      case 'FULL_TIME':
      case 'COMPLETED':
      case 'FINISHED':
        return 'TERMINE';
      default:
        return 'PROGRAMME';
    }
  })
  .set(function (val: string) {
    switch (val) {
      case 'PROGRAMME':
        this.matchStatus = 'SCHEDULED';
        break;
      case 'EN_COURS':
        // Only change if not already in an in-game status
        if (!['FIRST_HALF', 'HALF_TIME', 'SECOND_HALF'].includes(this.matchStatus)) {
          this.matchStatus = 'FIRST_HALF';
        }
        break;
      case 'TERMINE':
        this.matchStatus = 'FINISHED';
        break;
    }
  });

// Enable virtuals in JSON and plain object output
MatchSchema.set('toJSON', { virtuals: true });
MatchSchema.set('toObject', { virtuals: true });
