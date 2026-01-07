import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchStatistics, MatchStatisticsDocument } from '../schemas/match-statistics.schema';
import { UpdateMatchStatisticsDto } from './dto/match.dto';

@Injectable()
export class MatchStatisticsService {
    constructor(
        @InjectModel(MatchStatistics.name)
        private matchStatisticsModel: Model<MatchStatisticsDocument>,
    ) { }

    async create(matchId: string, team1Id: string, team2Id: string): Promise<MatchStatistics> {
        const stats = new this.matchStatisticsModel({
            matchId: new Types.ObjectId(matchId),
            team1Id: new Types.ObjectId(team1Id),
            team2Id: new Types.ObjectId(team2Id),
        });
        return stats.save();
    }

    async findByMatch(matchId: string): Promise<MatchStatistics | null> {
        const stats = await this.matchStatisticsModel
            .findOne({ matchId: new Types.ObjectId(matchId) })
            .exec();

        if (stats) {
            // Apply runtime defaults if fields are missing
            const defaultStats = {
                possession: 50,
                shots: 0,
                shotsOnTarget: 0,
                corners: 0,
                fouls: 0,
                yellowCards: 0,
                redCards: 0
            };

            if (!stats.team1Stats) {
                stats.team1Stats = { ...defaultStats };
            } else {
                // Ensure all properties exist
                stats.team1Stats = { ...defaultStats, ...stats.team1Stats };
            }

            if (!stats.team2Stats) {
                stats.team2Stats = { ...defaultStats };
            } else {
                // Ensure all properties exist
                stats.team2Stats = { ...defaultStats, ...stats.team2Stats };
            }
        }

        return stats;
    }

    async updateStatistics(
        matchId: string,
        updateDto: UpdateMatchStatisticsDto,
    ): Promise<MatchStatistics | null> {
        const stats = await this.findByMatch(matchId);
        if (!stats) return null;

        const isTeam1 = stats.team1Id.toString() === updateDto.teamId;
        const teamField = isTeam1 ? 'team1Stats' : 'team2Stats';

        const updateData: any = {};
        if (updateDto.possession !== undefined) {
            updateData[`${teamField}.possession`] = updateDto.possession;
            // Auto-adjust opponent possession
            const opponentField = isTeam1 ? 'team2Stats' : 'team1Stats';
            updateData[`${opponentField}.possession`] = 100 - updateDto.possession;
        }
        if (updateDto.shots !== undefined) updateData[`${teamField}.shots`] = updateDto.shots;
        if (updateDto.shotsOnTarget !== undefined) updateData[`${teamField}.shotsOnTarget`] = updateDto.shotsOnTarget;
        if (updateDto.corners !== undefined) updateData[`${teamField}.corners`] = updateDto.corners;
        if (updateDto.fouls !== undefined) updateData[`${teamField}.fouls`] = updateDto.fouls;

        return this.matchStatisticsModel
            .findOneAndUpdate(
                { matchId: new Types.ObjectId(matchId) },
                { $set: updateData },
                { new: true },
            )
            .exec();
    }

    async incrementStat(matchId: string, teamId: string, stat: string): Promise<void> {
        const stats = await this.findByMatch(matchId);
        if (!stats) return;

        const isTeam1 = stats.team1Id.toString() === teamId;
        const teamField = isTeam1 ? 'team1Stats' : 'team2Stats';

        await this.matchStatisticsModel
            .findOneAndUpdate(
                { matchId: new Types.ObjectId(matchId) },
                { $inc: { [`${teamField}.${stat}`]: 1 } },
            )
            .exec();
    }
}
