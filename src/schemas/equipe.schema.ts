// src/schemas/equipe.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { StatsEquipe, StatsEquipeSchema } from './stats-equipe.schema';

export type EquipeDocument = Equipe & mongoose.Document;

export enum Categorie {
  KIDS = 'KIDS',
  YOUTH = 'YOUTH',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
}

@Schema({ timestamps: true })
export class Equipe {
    // Optional: Coach for the team
    @Prop({ required: false })
    id_coach?: string;
  // Reference to the Academy owner (User/OWNER entity ID)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  id_academie: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  nom: string;

  // Optional: Team logo/image URL
  @Prop({ required: false })
  logo?: string;

  // List of all team members (User IDs)
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  members: mongoose.Schema.Types.ObjectId[];

  // Starting lineup (subset of members)
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  starters: mongoose.Schema.Types.ObjectId[];

  // Substitute players (subset of members)
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  substitutes: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: true, enum: Categorie })
  categorie: Categorie;

  // Optional: Team description/bio
  @Prop({ required: false })
  description?: string;

  // Active status
  @Prop({ default: true })
  is_active: boolean;

  // Jersey number assignments
  @Prop({
    type: [{
      id_joueur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      numero: { type: Number, required: true }
    }],
    default: []
  })
  maillots: { id_joueur: mongoose.Types.ObjectId; numero: number }[];

  // Embedded sub-document for statistics
  @Prop({ type: StatsEquipeSchema, default: {} })
  stats: StatsEquipe;
}

export const EquipeSchema = SchemaFactory.createForClass(Equipe);

// Add virtual calculated fields
EquipeSchema.virtual('stats.win_rate').get(function () {
  if (!this.stats || this.stats.total_matches === 0) return 0;
  return parseFloat(((this.stats.wins / this.stats.total_matches) * 100).toFixed(2));
});

EquipeSchema.virtual('stats.goal_difference').get(function () {
  if (!this.stats) return 0;
  return this.stats.goals_for - this.stats.goals_against;
});

EquipeSchema.virtual('stats.avg_goals_per_match').get(function () {
  if (!this.stats || this.stats.total_matches === 0) return 0;
  return parseFloat((this.stats.goals_for / this.stats.total_matches).toFixed(2));
});

EquipeSchema.virtual('stats.form_rating').get(function () {
  if (!this.stats || !this.stats.last_five_matches || this.stats.last_five_matches.length === 0) return 5;

  // W = 2 points, D = 1 point, L = 0 points
  const points = this.stats.last_five_matches.reduce((sum, match) => {
    if (match.result === 'W') return sum + 2;
    if (match.result === 'D') return sum + 1;
    return sum;
  }, 0);

  // Convert to 1-10 scale (max possible = 10)
  return Math.ceil((points / 10) * 10);
});

EquipeSchema.virtual('stats.momentum_indicator').get(function () {
  if (!this.stats || !this.stats.last_five_matches || this.stats.last_five_matches.length < 3) return 'Stable';

  const recent3 = this.stats.last_five_matches.slice(-3);
  const wins = recent3.filter(m => m.result === 'W').length;
  const losses = recent3.filter(m => m.result === 'L').length;

  if (wins >= 2) return 'Rising';
  if (losses >= 2) return 'Declining';
  return 'Stable';
});

// Enable virtuals in JSON output
EquipeSchema.set('toJSON', { virtuals: true });
EquipeSchema.set('toObject', { virtuals: true });