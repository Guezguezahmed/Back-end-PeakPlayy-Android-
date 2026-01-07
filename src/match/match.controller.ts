// src/match/match.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Statut } from 'src/schemas/match.schema';
import { MatchEventService } from './match-event.service';
import { MatchStatisticsService } from './match-statistics.service';
import { BracketService } from 'src/coupe/bracket.service';
import { InjectModel } from '@nestjs/mongoose';
import { Match } from 'src/schemas/match.schema';
import { Model } from 'mongoose';

@ApiTags('Matches')
@ApiBearerAuth('access-token')
@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly matchEventService: MatchEventService,
    private readonly matchStatisticsService: MatchStatisticsService,
    private readonly bracketService: BracketService,
    @InjectModel(Match.name) private matchModel: Model<Match>,
  ) { }

  // POST /matches: Only OWNER can schedule a match
  @Post()
  @Roles('OWNER')
  @ApiOperation({
    summary: 'Créer/programmer un nouveau match (OWNER uniquement)',
  })
  @ApiResponse({ status: 201, description: 'Match créé avec succès.' })
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchService.create(createMatchDto);
  }

  // GET /matches: All roles can view the schedule
  @Get()
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher la liste de tous les matchs' })
  @ApiResponse({ status: 200, description: 'Liste des matchs récupérée.' })
  findAll() {
    return this.matchService.findAll();
  }

  // GET /matches/stats/referee/:id
  @Get('stats/referee/:id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Obtenir les statistiques dynamiques d un arbitre' })
  async getRefereeStats(@Param('id') id: string) {
    return this.matchService.getRefereeStats(id);
  }

  // GET /matches/:id
  @Get(':id')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: "Afficher les détails d'un match par ID" })
  @ApiParam({ name: 'id', description: 'ID du match' })
  findOne(@Param('id') id: string) {
    return this.matchService.findOne(id);
  }

  // PATCH /matches/:id: Restricted to OWNER (for rescheduling) and ARBITRE (for status/score updates)
  @Patch(':id')
  @Roles('OWNER', 'ARBITRE')
  @ApiOperation({
    summary:
      'Modifier un match (OWNER pour les détails, ARBITRE pour le statut/score)',
  })
  async update(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
    @Req() req: any,
  ) {
    const match = await this.matchService.findOne(id);
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found.`);
    }

    // ARBITRE can only update score and status, and only for the match they are assigned to
    if (userRole === 'ARBITRE') {
      const allowedArbitreUpdates = ['score_eq1', 'score_eq2', 'statut'];
      for (const key of Object.keys(updateMatchDto)) {
        if (!allowedArbitreUpdates.includes(key)) {
          throw new ForbiddenException(
            `L'arbitre n'est autorisé à modifier que le statut et les scores.`,
          );
        }
      }
    }

    return this.matchService.update(id, updateMatchDto);
  }

  // DELETE /matches/:id: Only OWNER can delete
  @Delete(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Supprimer un match (OWNER uniquement)' })
  @ApiResponse({ status: 200, description: 'Match supprimé avec succès.' })
  remove(@Param('id') id: string) {
    return this.matchService.remove(id);
  }

  // ===== MATCH STATISTICS ENDPOINTS ===== //

  @Get(':matchId/scorers/:idAcademie')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({ summary: 'Afficher les joueurs ayant marqué dans ce match' })
  @ApiParam({ name: 'matchId', description: 'ID du match' })
  @ApiParam({
    name: 'idAcademie',
    description: "Param ignoré (compatibilité): ID d'équipe",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des buteurs (infos utilisateur sans champs sensibles).',
  })
  async getScorersByAcademie(
    @Param('matchId') matchId: string,
    @Param('idAcademie') idAcademie: string,
  ) {
    return this.matchService.getScorersByAcademie(matchId, idAcademie);
  }

  @Get(':matchId/cards/:idAcademie/:color')
  @Roles('JOUEUR', 'OWNER', 'ARBITRE', 'COACH')
  @ApiOperation({
    summary:
      "Afficher les joueurs ayant reçu un carton (yellow/red) dans ce match",
  })
  async getCardsByAcademie(
    @Param('matchId') matchId: string,
    @Param('idAcademie') idAcademie: string,
    @Param('color') color: 'yellow' | 'red',
  ) {
    return this.matchService.getCardsByAcademie(matchId, idAcademie, color);
  }

  @Post(':matchId/carton')
  async addCartonToMatch(
    @Param('matchId') matchId: string,
    @Body('idJoueur') idJoueur: string,
    @Body('categorie') categorie: string,
    @Body('color') color: 'yellow' | 'red',
  ) {
    return this.matchService.addCartonToMatch(
      matchId,
      idJoueur,
      categorie,
      color,
    );
  }

  @Post(':matchId/stat')
  async addStatToMatch(
    @Param('matchId') matchId: string,
    @Body('idJoueur') idJoueur: string,
    @Body('equipe') equipe: 'eq1' | 'eq2',
    @Body('type') type: 'but' | 'assist',
  ) {
    return this.matchService.addStatToMatch(matchId, idJoueur, equipe, type);
  }

  @Post('add-offside/:matchId/:idAcademie')
  async addOffside(
    @Param('matchId') matchId: string,
    @Param('idAcademie') idAcademie: string,
  ) {
    return this.matchService.addOffside(matchId, idAcademie);
  }

  // ===== TOURNAMENT BRACKET OFFICIATING ===== //

  @Post(':id/bracket/start')
  @ApiOperation({ summary: 'Start a match (1st half)' })
  async startMatchOfficiate(@Param('id') matchId: string) {
    const match = await this.matchService.findOne(matchId);
    if (!match) throw new Error('Match not found');

    if (match.id_equipe1 && match.id_equipe2) {
      const existingStats = await this.matchStatisticsService.findByMatch(matchId);
      if (!existingStats) {
        await this.matchStatisticsService.create(
          matchId,
          match.id_equipe1.toString(),
          match.id_equipe2.toString(),
        );
      }
    }

    return this.matchService.update(matchId, {
      matchStatus: 'FIRST_HALF',
      statut: Statut.EN_COURS,
    } as any);
  }

  @Post(':id/bracket/end-first-half')
  async endFirstHalfOfficiate(@Param('id') matchId: string) {
    return this.matchService.update(matchId, {
      matchStatus: 'HALF_TIME',
    } as any);
  }

  @Post(':id/bracket/start-second-half')
  async startSecondHalfOfficiate(@Param('id') matchId: string) {
    return this.matchService.update(matchId, {
      matchStatus: 'SECOND_HALF',
    } as any);
  }

  @Post(':id/bracket/end-match')
  async endMatchOfficiate(@Param('id') matchId: string) {
    await this.matchService.syncScoresFromEvents(matchId);
    await this.matchService.update(matchId, {
      statut: Statut.TERMINE,
      matchStatus: 'FINISHED',
      isOfficiated: true,
    } as any);
    setTimeout(async () => {
      await this.bracketService.progressWinner(matchId);
    }, 2000);
    return { success: true };
  }

  @Post(':id/bracket/update-time')
  async updateCurrentMinute(
    @Param('id') matchId: string,
    @Body() body: { currentMinute: number },
  ) {
    return this.matchService.update(matchId, {
      currentMinute: body.currentMinute,
    } as any);
  }

  @Post(':id/bracket/goal')
  async addGoalToBracket(
    @Param('id') matchId: string,
    @Body() body: any,
  ) {
    const event = await this.matchEventService.create({
      matchId,
      type: 'GOAL',
      ...body,
    });

    const match = await this.matchService.findOne(matchId);
    if (!match) throw new Error('Match not found');

    const isTeam1 = match.id_equipe1?.toString() === body.teamId;
    if (isTeam1) {
      await this.matchModel.findByIdAndUpdate(matchId, {
        $push: { But_eq1: body.playerId },
        $inc: { score_eq1: 1 }
      });
    } else {
      await this.matchModel.findByIdAndUpdate(matchId, {
        $push: { But_eq2: body.playerId },
        $inc: { score_eq2: 1 }
      });
    }
    return event;
  }

  @Post(':id/bracket/card')
  async addCardToBracket(
    @Param('id') matchId: string,
    @Body() body: any,
  ) {
    const event = await this.matchEventService.create({
      matchId,
      ...body,
    });

    const match = await this.matchService.findOne(matchId);
    if (!match) throw new Error('Match not found');

    const isTeam1 = match.id_equipe1?.toString() === body.teamId;
    if (body.type === 'YELLOW_CARD') {
      const field = isTeam1 ? 'cartonJaune_eq1' : 'cartonJaune_eq2';
      await this.matchModel.findByIdAndUpdate(matchId, {
        $push: {
          [field]: body.playerId,
          cartonJaune: body.playerId
        }
      });
    } else if (body.type === 'RED_CARD') {
      const field = isTeam1 ? 'cartonRouge_eq1' : 'cartonRouge_eq2';
      await this.matchModel.findByIdAndUpdate(matchId, {
        $push: {
          [field]: body.playerId,
          cartonRouge: body.playerId
        }
      });
    }

    const statField = body.type === 'YELLOW_CARD' ? 'yellowCards' : 'redCards';
    await this.matchStatisticsService.incrementStat(matchId, body.teamId, statField);
    return event;
  }

  @Post(':id/bracket/substitution')
  async addSubstitutionToBracket(
    @Param('id') matchId: string,
    @Body() body: any,
  ) {
    return this.matchEventService.create({
      matchId,
      type: 'SUBSTITUTION',
      ...body,
    });
  }

  @Post(':id/bracket/penalties')
  async recordPenaltyShootout(
    @Param('id') matchId: string,
    @Body() body: { penaltyScore_eq1: number; penaltyScore_eq2: number },
  ) {
    return this.matchService.update(matchId, {
      hasPenaltyShootout: true,
      penaltyScore_eq1: body.penaltyScore_eq1,
      penaltyScore_eq2: body.penaltyScore_eq2,
    } as any);
  }

  @Post(':id/bracket/sync-scores')
  async syncScoresFromEvents(@Param('id') matchId: string) {
    return this.matchService.syncScoresFromEvents(matchId);
  }

  @Get(':id/bracket/events')
  async getBracketEvents(@Param('id') matchId: string) {
    return this.matchEventService.findByMatch(matchId);
  }

  @Get(':id/bracket/statistics')
  async getBracketStatistics(@Param('id') matchId: string) {
    return this.matchStatisticsService.findByMatch(matchId);
  }

  @Patch(':id/bracket/statistics')
  async updateBracketStatistics(
    @Param('id') matchId: string,
    @Body() body: any,
  ) {
    return this.matchStatisticsService.updateStatistics(matchId, body);
  }

  @Get(':id/bracket/full-data')
  async getFullBracketMatchData(@Param('id') matchId: string) {
    const match = await this.matchService.findOne(matchId);
    const events = await this.matchEventService.findByMatch(matchId);
    const statistics = await this.matchStatisticsService.findByMatch(matchId);
    return { match, events, statistics };
  }
}
