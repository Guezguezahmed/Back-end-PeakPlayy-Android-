import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchEvent, MatchEventDocument } from '../schemas/match-event.schema';
import { CreateMatchEventDto } from './dto/match.dto';

@Injectable()
export class MatchEventService {
    constructor(
        @InjectModel(MatchEvent.name)
        private matchEventModel: Model<MatchEventDocument>,
    ) { }

    async create(createDto: CreateMatchEventDto): Promise<MatchEvent> {
        // Validate that matchId and teamId are valid ObjectIds
        if (!Types.ObjectId.isValid(createDto.matchId)) {
            throw new Error(`Invalid matchId: ${createDto.matchId}`);
        }
        if (!Types.ObjectId.isValid(createDto.teamId)) {
            throw new Error(`Invalid teamId: ${createDto.teamId}`);
        }

        const event = new this.matchEventModel({
            ...createDto,
            matchId: new Types.ObjectId(createDto.matchId),
            teamId: new Types.ObjectId(createDto.teamId),
            playerId: createDto.playerId && Types.ObjectId.isValid(createDto.playerId)
                ? new Types.ObjectId(createDto.playerId)
                : undefined,
            assistPlayerId: createDto.assistPlayerId && Types.ObjectId.isValid(createDto.assistPlayerId)
                ? new Types.ObjectId(createDto.assistPlayerId)
                : undefined,
            playerOutId: createDto.playerOutId && Types.ObjectId.isValid(createDto.playerOutId)
                ? new Types.ObjectId(createDto.playerOutId)
                : undefined,
            playerInId: createDto.playerInId && Types.ObjectId.isValid(createDto.playerInId)
                ? new Types.ObjectId(createDto.playerInId)
                : undefined,
        });
        return event.save();
    }

    async findByMatch(matchId: string): Promise<MatchEvent[]> {
        return this.matchEventModel
            .find({ matchId: new Types.ObjectId(matchId) })
            .sort({ minute: 1 })
            .exec();
    }

    async findByMatchAndType(matchId: string, type: string): Promise<MatchEvent[]> {
        return this.matchEventModel
            .find({
                matchId: new Types.ObjectId(matchId),
                type: type,
            })
            .sort({ minute: 1 })
            .exec();
    }

    async deleteEvent(eventId: string): Promise<MatchEvent | null> {
        return this.matchEventModel.findByIdAndDelete(eventId).exec();
    }
}
