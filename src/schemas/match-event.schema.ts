import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MatchEventDocument = MatchEvent & Document;

@Schema({ timestamps: true })
export class MatchEvent {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Match' })
    matchId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    type: string; // "GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Equipe' })
    teamId: MongooseSchema.Types.ObjectId;

    @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'Membre' })
    playerId: MongooseSchema.Types.ObjectId;

    @Prop({ required: false })
    playerName: string;

    @Prop({ required: true })
    minute: number;

    @Prop({ required: true })
    half: string; // "FIRST_HALF", "SECOND_HALF"

    // For goals - assist tracking
    @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'Membre' })
    assistPlayerId: MongooseSchema.Types.ObjectId;

    @Prop({ required: false })
    assistPlayerName: string;

    // For substitutions
    @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'Membre' })
    playerOutId: MongooseSchema.Types.ObjectId;

    @Prop({ required: false })
    playerOutName: string;

    @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'Membre' })
    playerInId: MongooseSchema.Types.ObjectId;

    @Prop({ required: false })
    playerInName: string;
}

export const MatchEventSchema = SchemaFactory.createForClass(MatchEvent);

// Index for efficient queries
MatchEventSchema.index({ matchId: 1, minute: 1 });
MatchEventSchema.index({ matchId: 1, type: 1 });
