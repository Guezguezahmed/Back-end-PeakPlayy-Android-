import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupe } from '../schemas/coupe.schema';
import { Match } from '../schemas/match.schema';
import { Equipe } from '../schemas/equipe.schema';

@Injectable()
export class BracketService {
    constructor(
        @InjectModel('Coupe') private coupeModel: Model<Coupe>,
        @InjectModel('Match') private matchModel: Model<Match>,
        @InjectModel('Equipe') private equipeModel: Model<Equipe>,
    ) { }

    /**
     * Generate tournament bracket with randomized first round
     * Participants are User IDs - we need to find their academy's Equipe for this category
     */
    async generateBracket(coupeId: string): Promise<any> {
        const coupe = await this.coupeModel
            .findById(coupeId)
            .exec(); // Don't populate - participants are User IDs stored as raw ObjectIds

        if (!coupe) {
            throw new BadRequestException('Tournament not found');
        }

        const totalUsers = coupe.participants.length;

        // Validate tournament has valid bracket size (4, 8, 16, or 32 users)
        const validSizes = [4, 8, 16, 32];
        if (!validSizes.includes(totalUsers)) {
            throw new BadRequestException(`Tournament must have exactly 4, 8, 16, or 32 participants. Current: ${totalUsers}`);
        }

        if (coupe.isBracketGenerated) {
            throw new BadRequestException('Bracket already generated');
        }

        // For each participant (User), find their academy's Equipe for this tournament category
        const teamIds: any[] = [];
        for (const participant of coupe.participants) {
            const participantId = (participant as any)._id || participant;

            // Find the Equipe that belongs to this user's academy with matching category
            // Note: Participants are Users who own academies, so we need to find equipes where
            // the id_academie field matches an academy owned by this user
            // Since we don't have a direct link, we'll use the user's _id as the academy ID reference
            const equipe = await this.equipeModel.findOne({
                id_academie: participantId,
                categorie: coupe.categorie.toUpperCase() // Convert to match Equipe enum: KIDS, YOUTH, etc.
            }).exec();

            if (!equipe) {
                throw new BadRequestException(
                    `No team found for participant ${participantId} in category ${coupe.categorie}. Please ensure all participants have a team in this category.`
                );
            }

            teamIds.push(equipe._id);
        }

        // Shuffle teams randomly
        const shuffledTeams = this.shuffleArray(teamIds);

        // Calculate rounds needed
        const rounds = this.calculateRounds(totalUsers);

        // Create all matches
        const allMatches: any[] = [];
        let previousRoundMatches: any[] = [];

        // Create first round with actual teams
        const firstRoundMatches: any[] = [];
        for (let i = 0; i < shuffledTeams.length; i += 2) {
            const match = await this.matchModel.create({
                coupeId: new Types.ObjectId(coupeId),
                id_equipe1: shuffledTeams[i],
                id_equipe2: shuffledTeams[i + 1],
                roundName: rounds[0].name,
                roundNumber: 1,
                matchNumber: Math.floor(i / 2) + 1,
                round: 1,
                date: coupe.date_debut,
                score_eq1: 0,
                score_eq2: 0,
                statut: 'PROGRAMME',
                matchStatus: 'SCHEDULED',
            });
            firstRoundMatches.push(match);
            allMatches.push(match);
        }

        previousRoundMatches = firstRoundMatches;

        // Create subsequent rounds with TBD (no teams yet)
        for (let r = 1; r < rounds.length; r++) {
            const roundMatches: any[] = [];
            const matchesInRound = previousRoundMatches.length / 2;

            for (let m = 0; m < matchesInRound; m++) {
                const match = await this.matchModel.create({
                    coupeId: new Types.ObjectId(coupeId),
                    roundName: rounds[r].name,
                    roundNumber: r + 1,
                    matchNumber: m + 1,
                    round: r + 1,
                    date: this.calculateMatchDate(coupe.date_debut, r + 1),
                    score_eq1: 0,
                    score_eq2: 0,
                    statut: 'PROGRAMME',
                    matchStatus: 'SCHEDULED',
                });

                // Link previous matches to this match
                const prevMatch1 = previousRoundMatches[m * 2];
                const prevMatch2 = previousRoundMatches[m * 2 + 1];

                await this.matchModel.findByIdAndUpdate(prevMatch1._id, {
                    nextMatch: match._id,
                    positionInNextMatch: 'eq1',
                });

                await this.matchModel.findByIdAndUpdate(prevMatch2._id, {
                    nextMatch: match._id,
                    positionInNextMatch: 'eq2',
                });

                roundMatches.push(match);
                allMatches.push(match);
            }

            previousRoundMatches = roundMatches;
        }

        // Update coupe with generated matches
        await this.coupeModel.findByIdAndUpdate(coupeId, {
            matches: allMatches.map((m) => m._id),
            isBracketGenerated: true,
            tournamentStatus: 'BRACKET_GENERATED',
        });

        return {
            success: true,
            rounds: await this.getBracket(coupeId),
        };
    }

    /**
     * Get complete bracket structure
     */
    async getBracket(coupeId: string): Promise<any> {
        const matches = await this.matchModel
            .find({ coupeId: new Types.ObjectId(coupeId) })
            .populate('id_equipe1 id_equipe2')
            .sort({ roundNumber: 1, matchNumber: 1 })
            .exec();

        // Group by round
        const roundsMap = new Map();
        matches.forEach((match) => {
            if (!roundsMap.has(match.roundName)) {
                roundsMap.set(match.roundName, []);
            }
            roundsMap.get(match.roundName).push(match);
        });

        const rounds: any[] = [];
        roundsMap.forEach((matches, roundName) => {
            rounds.push({
                name: roundName,
                matches: matches,
            });
        });

        return rounds;
    }

    /**
     * Progress winner to next round
     */
    async progressWinner(matchId: string): Promise<void> {
        const match = await this.matchModel.findById(matchId).exec();
        if (!match) return;

        if (match.matchStatus !== 'COMPLETED') return;

        // Determine winner
        const winnerId =
            match.score_eq1 > match.score_eq2
                ? match.id_equipe1
                : match.id_equipe2;

        await this.matchModel.findByIdAndUpdate(matchId, {
            winnerId: winnerId,
        });

        // Progress to next match
        if (match.nextMatch) {
            const updateField =
                match.positionInNextMatch === 'eq1' ? 'id_equipe1' : 'id_equipe2';

            await this.matchModel.findByIdAndUpdate(match.nextMatch, {
                [updateField]: winnerId,
            });
        } else {
            // This was the final - update tournament winner
            await this.coupeModel.findByIdAndUpdate(match.coupeId, {
                id_vainqueur: winnerId,
                tournamentStatus: 'COMPLETED',
            });
        }
    }

    /**
     * Helper: Calculate round names based on team count
     */
    private calculateRounds(teamCount: number): Array<{ name: string }> {
        const rounds: Array<{ name: string }> = [];
        let remaining = teamCount;

        while (remaining > 1) {
            switch (remaining) {
                case 2:
                    rounds.push({ name: 'Final' });
                    break;
                case 4:
                    rounds.push({ name: 'Semi Finals' });
                    break;
                case 8:
                    rounds.push({ name: 'Quarter Finals' });
                    break;
                case 16:
                    rounds.push({ name: 'Round of 16' });
                    break;
                case 32:
                    rounds.push({ name: 'Round of 32' });
                    break;
            }
            remaining = remaining / 2;
        }

        return rounds.reverse();
    }

    /**
     * Helper: Shuffle array randomly
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Helper: Calculate match date based on round
     */
    private calculateMatchDate(startDate: Date, roundNumber: number): Date {
        const date = new Date(startDate);
        date.setDate(date.getDate() + roundNumber * 3); // 3 days between rounds
        return date;
    }
}
