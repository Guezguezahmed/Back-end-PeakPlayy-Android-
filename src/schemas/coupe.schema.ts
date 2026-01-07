// src/schemas/coupe.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';


export enum CoupeCategorie {
  KIDS = 'Kids',
  YOUTH = 'Youth',
  JUNIOR = 'Junior',
  SENIOR = 'Senior',
}

export enum CoupeType {
  TOURNAMENT = 'Tournament',
  LEAGUE = 'League',
}


@Schema({ timestamps: true })
export class Coupe {
  @Prop({ required: true })
  nom: string;

  // Organizer (User with OWNER role)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  id_organisateur: mongoose.Schema.Types.ObjectId;

  // Participating teams
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipe' }], default: [] })
  participants: mongoose.Schema.Types.ObjectId[];

  // Match history
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }], default: [] })
  matches: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: true })
  date_debut: Date;

  @Prop({ required: true })
  date_fin: Date;

  @Prop({ required: true, enum: CoupeCategorie })
  categorie: CoupeCategorie;

  @Prop({ required: true, enum: CoupeType })
  type: CoupeType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Equipe', required: false })
  id_vainqueur?: mongoose.Schema.Types.ObjectId;

  // --- NEW FIELDS ---
  @Prop({ required: true })
  tournamentName: string;

  @Prop({ required: true })
  stadium: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  maxParticipants: number;

  @Prop()
  entryFee?: number;

  @Prop()
  prizePool?: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
  referee: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: 1 })
  currentRound: number;

  @Prop({ default: false })
  isBracketGenerated: boolean;

  @Prop({ default: 'REGISTRATION' })
  tournamentStatus: string; // "REGISTRATION", "BRACKET_GENERATED", "IN_PROGRESS", "COMPLETED"


}

export const CoupeSchema = SchemaFactory.createForClass(Coupe);
