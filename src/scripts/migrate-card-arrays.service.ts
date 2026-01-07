import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match } from '../schemas/match.schema';
import { MatchEvent } from '../schemas/match-event.schema';

@Injectable()
export class CardMigrationService {
    constructor(
        @InjectModel(Match.name) private matchModel: Model<Match>,
        @InjectModel('MatchEvent') private matchEventModel: Model<MatchEvent>,
    ) { }

    async migrateCardArrays() {
        console.log('🔄 Starting card array migration...');

        const matches = await this.matchModel.find({
            $or: [
                { cartonJaune: { $exists: true, $not: { $size: 0 } } },
                { cartonRouge: { $exists: true, $not: { $size: 0 } } }
            ]
        }).exec();

        console.log(`📊 Found ${matches.length} matches with cards to migrate`);

        let migrated = 0;
        let failed = 0;

        for (const match of matches) {
            try {
                const updates: any = {};

                // Migrate yellow cards
                if (match.cartonJaune && match.cartonJaune.length > 0) {
                    const yellowCardEvents = await this.matchEventModel.find({
                        matchId: match._id,
                        type: 'YELLOW_CARD'
                    }).exec();

                    const team1YellowCards: any[] = [];
                    const team2YellowCards: any[] = [];

                    for (const event of yellowCardEvents) {
                        const isTeam1 = event.teamId.toString() === match.id_equipe1.toString();
                        if (isTeam1) {
                            team1YellowCards.push(event.playerId);
                        } else {
                            team2YellowCards.push(event.playerId);
                        }
                    }

                    if (team1YellowCards.length > 0) updates.cartonJaune_eq1 = team1YellowCards;
                    if (team2YellowCards.length > 0) updates.cartonJaune_eq2 = team2YellowCards;
                }

                // Migrate red cards
                if (match.cartonRouge && match.cartonRouge.length > 0) {
                    const redCardEvents = await this.matchEventModel.find({
                        matchId: match._id,
                        type: 'RED_CARD'
                    }).exec();

                    const team1RedCards: any[] = [];
                    const team2RedCards: any[] = [];

                    for (const event of redCardEvents) {
                        const isTeam1 = event.teamId.toString() === match.id_equipe1.toString();
                        if (isTeam1) {
                            team1RedCards.push(event.playerId);
                        } else {
                            team2RedCards.push(event.playerId);
                        }
                    }

                    if (team1RedCards.length > 0) updates.cartonRouge_eq1 = team1RedCards;
                    if (team2RedCards.length > 0) updates.cartonRouge_eq2 = team2RedCards;
                }

                if (Object.keys(updates).length > 0) {
                    await this.matchModel.updateOne({ _id: match._id }, updates);
                    console.log(`✅ Migrated cards for match ${match._id}`);
                    migrated++;
                }
            } catch (error) {
                console.error(`❌ Failed to migrate match ${match._id}:`, error.message);
                failed++;
            }
        }

        console.log(`\n🎉 Migration complete!`);
        console.log(`✅ Successfully migrated: ${migrated} matches`);
        console.log(`❌ Failed: ${failed} matches`);

        return { migrated, failed, total: matches.length };
    }
}
