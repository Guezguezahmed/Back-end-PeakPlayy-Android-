// src/match/match.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, Statut } from 'src/schemas/match.schema';
import { Equipe } from 'src/schemas/equipe.schema';
import { User } from 'src/schemas/user.schemas';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchEventService } from './match-event.service';
import { MatchStatistics } from 'src/schemas/match-statistics.schema';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<Match>,
    @InjectModel(Equipe.name) private equipeModel: Model<Equipe>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(MatchStatistics.name) private matchStatisticsModel: Model<MatchStatistics>,
    private matchEventService: MatchEventService,
  ) { }

  // **C**REATE
  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    if (createMatchDto.id_equipe1 === createMatchDto.id_equipe2) {
      throw new BadRequestException(
        'Une équipe ne peut pas jouer contre elle-même.',
      );
    }
    const newMatch = new this.matchModel(createMatchDto);
    return newMatch.save();
  }

  // **R**EAD ALL
  findAll(): Promise<Match[]> {
    return this.matchModel
      .find()
      .populate('id_equipe1', 'nom')
      .populate('id_equipe2', 'nom')
      .populate('id_terrain', 'localisation name')
      .populate('id_arbitre', 'nom prenom')
      .exec();
  }

  // **R**EAD ONE
  findOne(id: string): Promise<Match | null> {
    return this.matchModel
      .findById(id)
      .populate('id_equipe1', 'nom logo')
      .populate('id_equipe2', 'nom logo')
      .populate('id_terrain', 'localisation name')
      .populate('id_arbitre', 'nom prenom')
      .exec();
  }

  // **U**PDATE (Finish + Stats + Qualification)
  async update(
    id: string,
    updateMatchDto: UpdateMatchDto,
  ): Promise<Match | null> {
    const existingMatch = await this.matchModel.findById(id).exec();
    if (!existingMatch) return null;

    const willFinish =
      updateMatchDto.statut === Statut.TERMINE &&
      existingMatch.statut !== Statut.TERMINE;

    const hasScores =
      updateMatchDto.score_eq1 !== undefined &&
      updateMatchDto.score_eq2 !== undefined;

    // Allow matches to finish with 0-0 for officiated matches
    // Scores can be calculated from match events (goals)
    // if (willFinish && !hasScores) {
    //   throw new BadRequestException(
    //     'Les scores sont obligatoires pour terminer le match.',
    //   );
    // }

    // Update match
    const updatedMatch = await this.matchModel
      .findByIdAndUpdate(id, updateMatchDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (updatedMatch && willFinish && hasScores) {
      await this.updateTeamStats(updatedMatch);
      await this.qualifyWinner(updatedMatch);
    }

    return updatedMatch;
  }

  // **QUALIFY WINNER**
  private async qualifyWinner(match: Match): Promise<void> {
    if (!match.nextMatch) return; // Last match → no qualification

    let winner: Types.ObjectId;

    const { score_eq1, score_eq2, id_equipe1, id_equipe2 } = match;

    if (score_eq1 > score_eq2) winner = id_equipe1 as any;
    else if (score_eq2 > score_eq1) winner = id_equipe2 as any;
    else {
      // Draw - check penalty shootout
      if (match.hasPenaltyShootout) {
        if (match.penaltyScore_eq1 > match.penaltyScore_eq2) {
          winner = id_equipe1 as any;
        } else if (match.penaltyScore_eq2 > match.penaltyScore_eq1) {
          winner = id_equipe2 as any;
        } else {
          // Still tied after penalties - should not happen
          throw new BadRequestException(
            'Match ended in draw even after penalty shootout',
          );
        }
      } else {
        // No penalty shootout yet - match cannot be completed
        throw new BadRequestException(
          'Match ended in draw. Please conduct penalty shootout before completing match.',
        );
      }
    }

    const nextMatch = await this.matchModel.findById(match.nextMatch).exec();
    if (!nextMatch) return;

    if (match.positionInNextMatch === 'eq1') {
      nextMatch.id_equipe1 = winner;
    } else if (match.positionInNextMatch === 'eq2') {
      nextMatch.id_equipe2 = winner;
    }

    await nextMatch.save();
  }

  // **UPDATE TEAM STATS**
  private async updateTeamStats(match: Match): Promise<void> {
    const { id_equipe1, id_equipe2 } = match;

    // Use actual goal counts from scorer arrays (source of truth)
    const score_eq1 = match.But_eq1?.length || 0;
    const score_eq2 = match.But_eq2?.length || 0;

    const stats1 = this.calculateStatsUpdate(score_eq1, score_eq2);
    const stats2 = this.calculateStatsUpdate(score_eq2, score_eq1);

    await this.equipeModel.findByIdAndUpdate(id_equipe1, {
      $inc: {
        'stats.nbrMatchJoue': 1,
        'stats.matchWin': stats1.matchWin,
        'stats.matchDraw': stats1.matchDraw,
        'stats.matchLoose': stats1.matchLoose,
        'stats.nbrButMarques': score_eq1,
        'stats.nbrButEncaisse': score_eq2,
      },
    });

    await this.equipeModel.findByIdAndUpdate(id_equipe2, {
      $inc: {
        'stats.nbrMatchJoue': 1,
        'stats.matchWin': stats2.matchWin,
        'stats.matchDraw': stats2.matchDraw,
        'stats.matchLoose': stats2.matchLoose,
        'stats.nbrButMarques': score_eq2,
        'stats.nbrButEncaisse': score_eq1,
      },
    });
  }

  // **HELPER**
  private calculateStatsUpdate(score1: number, score2: number) {
    if (score1 > score2) return { matchWin: 1, matchDraw: 0, matchLoose: 0 };
    if (score1 < score2) return { matchWin: 0, matchDraw: 0, matchLoose: 1 };
    return { matchWin: 0, matchDraw: 1, matchLoose: 0 };
  }

  // **CALCULATE SCORES FROM EVENTS**
  async calculateScoresFromEvents(
    matchId: string,
  ): Promise<{ score_eq1: number; score_eq2: number }> {
    const match = await this.findOne(matchId);
    if (!match) throw new NotFoundException('Match not found');

    const events = await this.matchEventService.findByMatchAndType(
      matchId,
      'GOAL',
    );

    let score_eq1 = 0;
    let score_eq2 = 0;

    events.forEach((event) => {
      if (event.teamId.toString() === match.id_equipe1.toString()) {
        score_eq1++;
      } else if (event.teamId.toString() === match.id_equipe2.toString()) {
        score_eq2++;
      }
    });

    return { score_eq1, score_eq2 };
  }

  // **SYNC SCORES FROM EVENTS**
  async syncScoresFromEvents(matchId: string): Promise<Match | null> {
    const scores = await this.calculateScoresFromEvents(matchId);

    return this.matchModel
      .findByIdAndUpdate(
        matchId,
        {
          ...scores,
          scoresCalculatedFromEvents: true,
        },
        { new: true },
      )
      .exec();
  }

  // **DELETE**
  remove(id: string): Promise<any> {
    return this.matchModel.findByIdAndDelete(id).exec();
  }

  // ===== MATCH STATISTICS MANAGEMENT ===== //

  async getScorersByAcademie(
    matchId: string,
    idAcademie: string,
  ): Promise<User[]> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match)
      throw new NotFoundException(`Match avec ID ${matchId} introuvable`);

    const allButs = [...(match.But_eq1 ?? []), ...(match.But_eq2 ?? [])];
    const butIds = Array.from(new Set(allButs.map((id: any) => id.toString())));

    if (butIds.length === 0) return [] as any;

    const joueurs = await this.userModel
      .find({
        _id: { $in: butIds },
        id_academie: idAcademie  // Filter by academy
      })
      .select('-password -verificationCode -codeExpiresAt')
      .exec();

    return joueurs as any;
  }

  async getCardsByAcademie(
    matchId: string,
    idAcademie: string,
    color: 'yellow' | 'red',
  ): Promise<User[]> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match)
      throw new NotFoundException(`Match avec ID ${matchId} introuvable`);

    const normalized = (color ?? '').toLowerCase();
    if (normalized !== 'yellow' && normalized !== 'red') {
      throw new BadRequestException(
        `Couleur invalide: ${color}. Utiliser 'yellow' ou 'red'.`,
      );
    }

    // Use new split card arrays
    const team1List =
      normalized === 'yellow'
        ? match.cartonJaune_eq1 ?? []
        : match.cartonRouge_eq1 ?? [];
    const team2List =
      normalized === 'yellow'
        ? match.cartonJaune_eq2 ?? []
        : match.cartonRouge_eq2 ?? [];

    const list = [...team1List, ...team2List];
    const userIds = Array.from(new Set(list.map((id: any) => id.toString())));

    if (userIds.length === 0) return [] as any;

    const joueurs = await this.userModel
      .find({
        _id: { $in: userIds },
        id_academie: idAcademie  // Filter by academy
      })
      .select('-password -verificationCode -codeExpiresAt')
      .exec();

    return joueurs as any;
  }

  async addCartonToMatch(
    matchId: string,
    idJoueur: string,
    categorie: string,
    color: 'yellow' | 'red',
  ): Promise<Match> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match)
      throw new NotFoundException(`Match avec ID ${matchId} introuvable`);

    const equipe = await this.equipeModel.findOne({ categorie }).exec();
    if (!equipe) {
      throw new NotFoundException(
        `Aucune équipe trouvée pour la catégorie ${categorie}`,
      );
    }

    const joueurObjectId = new Types.ObjectId(idJoueur);

    // Vérifier si le joueur est dans starters ou substitutes
    const allPlayers = [
      ...(equipe.starters ?? []),
      ...(equipe.substitutes ?? []),
    ];

    const joueurValide = allPlayers.some((m: any) =>
      m.toString() === idJoueur,
    );

    if (!joueurValide) {
      throw new BadRequestException(
        `Le joueur ${idJoueur} n'appartient pas à cette équipe (${categorie}).`,
      );
    }

    const normalized = color?.toLowerCase();
    if (normalized !== 'yellow' && normalized !== 'red') {
      throw new BadRequestException(
        `Couleur invalide: ${color}. Utiliser 'yellow' ou 'red'.`,
      );
    }

    if (normalized === 'yellow') {
      if (!Array.isArray(match.cartonJaune)) match.cartonJaune = [];

      const exists = match.cartonJaune.some(
        (m: any) => m.toString() === idJoueur,
      );

      if (!exists) match.cartonJaune.push(joueurObjectId as any);
    } else {
      if (!Array.isArray(match.cartonRouge)) match.cartonRouge = [];

      const exists = match.cartonRouge.some(
        (m: any) => m.toString() === idJoueur,
      );

      if (!exists) match.cartonRouge.push(joueurObjectId as any);
    }

    await match.save();
    return match;
  }

  async addStatToMatch(
    matchId: string,
    idJoueur: string,
    equipeNumber: 'eq1' | 'eq2',
    type: 'but' | 'assist',
  ): Promise<Match> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match)
      throw new NotFoundException(`Match avec ID ${matchId} introuvable`);

    const joueurObjectId = new Types.ObjectId(idJoueur);

    let targetField: string;

    if (type === 'but') {
      targetField = equipeNumber === 'eq1' ? 'But_eq1' : 'But_eq2';
    } else if (type === 'assist') {
      targetField = equipeNumber === 'eq1' ? 'assist_eq1' : 'assist_eq2';
    } else {
      throw new BadRequestException(`Type invalide: ${type}`);
    }

    if (!Array.isArray(match[targetField])) match[targetField] = [];
    match[targetField].push(joueurObjectId as any);

    await match.save();
    return match;
  }

  // Corner tracking moved to MatchStatisticsService
  // Use matchStatisticsService.incrementStat(matchId, teamId, 'corners')

  // Penalty kick tracking moved to MatchStatisticsService or removed
  // (Note: penalty_eq1/eq2 confused with penalty shootout - deprecated)

  async addOffside(
    matchId: string,
    idAcademie: string,
  ): Promise<Match> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match)
      throw new NotFoundException(`Match avec ID ${matchId} introuvable`);

    const acadId = new Types.ObjectId(idAcademie);

    const isEq1 = match.id_equipe1?.equals(acadId);
    const isEq2 = match.id_equipe2?.equals(acadId);

    if (!isEq1 && !isEq2) {
      throw new BadRequestException(
        `L'académie ne correspond à aucune équipe dans ce match.`,
      );
    }

    // Increment offside count (not array)
    if (isEq1) {
      match.offside_eq1 = (match.offside_eq1 || 0) + 1;
    } else if (isEq2) {
      match.offside_eq2 = (match.offside_eq2 || 0) + 1;
    }

    await match.save();
    return match;
  }
  async getRefereeStats(refereeId: string) {
    // 1. Get all matches for this referee
    const matches = await this.matchModel.find({ id_arbitre: refereeId }).exec();
    const matchIds = matches.map((m) => m._id);

    // 2. Count unique tournaments
    const uniqueTournaments = new Set(
      matches.map((m: any) => m.id_tournoi?.toString()).filter(Boolean),
    );

    // 3. Aggregate stats for these matches
    // Note: If no matches, aggregation returns empty.
    let totalCards = 0;
    let totalYellow = 0;
    let totalRed = 0;

    if (matchIds.length > 0) {
      const statsAggregation = await this.matchStatisticsModel.aggregate([
        { $match: { matchId: { $in: matchIds } } },
        {
          $group: {
            _id: null,
            totalYellowCards: {
              $sum: {
                $add: ['$team1Stats.yellowCards', '$team2Stats.yellowCards'],
              },
            },
            totalRedCards: {
              $sum: { $add: ['$team1Stats.redCards', '$team2Stats.redCards'] },
            },
          },
        },
      ]);

      if (statsAggregation.length > 0) {
        totalYellow = statsAggregation[0].totalYellowCards || 0;
        totalRed = statsAggregation[0].totalRedCards || 0;
        totalCards = totalYellow + totalRed;
      }
    }

    return {
      matches: matches.length,
      tournaments: uniqueTournaments.size,
      cards: totalCards,
      yellowCards: totalYellow,
      redCards: totalRed,
      rating: 4.7 // Placeholder - ideally get average rating if stored
    };
  }
}
