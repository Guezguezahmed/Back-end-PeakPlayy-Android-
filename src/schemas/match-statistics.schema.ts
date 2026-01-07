import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

class TeamStats {
    @Prop({ default: 50 })
    possession: number; // 0-100

    @Prop({ default: 0 })
    shots: number;

    @Prop({ default: 0 })
    shotsOnTarget: number;

    @Prop({ default: 0 })
    corners: number;

    @Prop({ default: 0 })
    fouls: number;

    @Prop({ default: 0 })
    yellowCards: number;

    @Prop({ default: 0 })
    redCards: number;
}

export type MatchStatisticsDocument = MatchStatistics & Document;

@Schema({ timestamps: true })
export class MatchStatistics {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Match', unique: true })
    matchId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Equipe' })
    team1Id: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Equipe' })
    team2Id: MongooseSchema.Types.ObjectId;

    @Prop({ type: TeamStats, default: () => ({}) })
    team1Stats: TeamStats;

    @Prop({ type: TeamStats, default: () => ({}) })
    team2Stats: TeamStats;
}

export const MatchStatisticsSchema = SchemaFactory.createForClass(MatchStatistics);

// Index for quick lookup
MatchStatisticsSchema.index({ matchId: 1 });
