// src/coupe/coupe.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Coupe } from 'src/schemas/coupe.schema';
import { CreateCoupeDto } from './dto/create-coupe.dto';
import { UpdateCoupeDto, UpdateCoupeParticipantsDto } from './dto/update-coupe.dto';
import { Match } from 'src/schemas/match.schema';

@Injectable()
export class CoupeService {
  constructor(@InjectModel(Coupe.name) private coupeModel: Model<Coupe>, @InjectModel(Match.name) private matchModel: Model<Match>,) { }

  // **C**REATE
  async create(createCoupeDto: CreateCoupeDto): Promise<Coupe> {
    const newCoupe = new this.coupeModel(createCoupeDto);
    return newCoupe.save();
  }

  // **R**EAD All
  findAll(): Promise<Coupe[]> {
    return this.coupeModel
      .find()
      .populate('id_organisateur', 'nom prenom')
      // Keep participants as IDs - they're User IDs stored in an Equipe-ref field
      .exec();
  }

  // **R**EAD One
  findOne(id: string): Promise<Coupe | null> {
    return this.coupeModel
      .findById(id)
      .populate('id_organisateur', 'nom prenom')
      .populate('participants', 'nom')
      .populate('id_vainqueur', 'nom')
      .exec();
  }

  // **U**PDATE (General)
  update(id: string, updateCoupeDto: UpdateCoupeDto): Promise<Coupe | null> {
    return this.coupeModel
      .findByIdAndUpdate(id, updateCoupeDto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  // **U**PDATE (Add Participant USER by userId)
  async addParticipantUser(coupeId: string, userId: string): Promise<Coupe> {
    const coupe = await this.coupeModel.findById(coupeId).exec();
    if (!coupe) {
      throw new NotFoundException(`Coupe with ID ${coupeId} not found.`);
    }
    if (coupe.participants.map(id => id.toString()).includes(userId)) {
      throw new BadRequestException('Cet utilisateur participe déjà à la Coupe.');
    }
    coupe.participants.push(userId as any);
    return coupe.save();
  }

  // **U**PDATE (Remove Participant)
  async removeParticipant(coupeId: string, { teamId }: UpdateCoupeParticipantsDto): Promise<Coupe> {
    const coupe = await this.coupeModel.findById(coupeId).exec();
    if (!coupe) {
      throw new NotFoundException(`Coupe with ID ${coupeId} not found.`);
    }

    const initialLength = coupe.participants.length;

    // Remove the team ID from the array
    coupe.participants = coupe.participants.filter(id => id.toString() !== teamId) as mongoose.Schema.Types.ObjectId[];

    if (coupe.participants.length === initialLength) {
      throw new NotFoundException('Cette équipe ne participe pas à la Coupe.');
    }

    return coupe.save();
  }

  // **D**ELETE
  remove(id: string): Promise<any> {
    return this.coupeModel.findByIdAndDelete(id).exec();
  }


  ////Génerrer la calendrier en élimination directe (bracket)////
  async generateBracket(coupeId: string) {
    const coupe = await this.coupeModel.findById(coupeId).exec();

    if (!coupe) throw new NotFoundException('Coupe introuvable');
    if ((coupe as any).isBracketGenerated) throw new BadRequestException('Le calendrier est déjà généré.');

    const teams = [...coupe.participants];
    const teamCount = teams.length;

    if (teamCount < 2) throw new BadRequestException('Il faut au moins 2 équipes pour générer un bracket.');

    // Vérifier puissance de 2 : 2,4,8,16,32...
    if ((teamCount & (teamCount - 1)) !== 0)
      throw new BadRequestException('Le nombre d’équipes doit être une puissance de 2.');

    const shuffled = teams.sort(() => Math.random() - 0.5);

    const matches: mongoose.Types.ObjectId[] = [];
    const matchIdsByRound: Record<number, mongoose.Types.ObjectId[]> = {};
    let currentRoundTeams = shuffled;
    let round = 1;

    // Générer tous les rounds
    while (currentRoundTeams.length >= 1) {
      matchIdsByRound[round] = [];
      const nextRoundTeamsCount = currentRoundTeams.length / 2;

      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        const match = await this.matchModel.create({
          id_equipe1: currentRoundTeams[i] || null,
          id_equipe2: currentRoundTeams[i + 1] || null,
          id_terrain: null,
          id_arbitre: null,
          statut: 'PROGRAMME',
          date: coupe.date,
          round,
          nextMatch: null,
          positionInNextMatch: null,
        });

        matchIdsByRound[round].push(match._id as mongoose.Types.ObjectId);
        matches.push(match._id as mongoose.Types.ObjectId);
      }

      // Préparer tableau d’équipes pour le round suivant (vainqueurs fictifs)
      currentRoundTeams = Array(nextRoundTeamsCount).fill(null);
      round++;
      if (currentRoundTeams.length === 1) break; // finale atteinte
    }

    // Lier chaque match avec le match suivant
    const rounds = Object.keys(matchIdsByRound).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < rounds.length - 1; i++) {
      const r = rounds[i], nextR = rounds[i + 1];
      for (let j = 0; j < matchIdsByRound[r].length; j++) {
        const nextMatchIndex = Math.floor(j / 2);
        const position = j % 2 === 0 ? 'eq1' : 'eq2';
        await this.matchModel.findByIdAndUpdate(matchIdsByRound[r][j], {
          nextMatch: matchIdsByRound[nextR][nextMatchIndex],
          positionInNextMatch: position,
        });
      }
    }

    // Mettre à jour la coupe
    (coupe as any).matches = matches;
    (coupe as any).isBracketGenerated = true;
    (coupe as any).currentRound = 1;
    await coupe.save();

    return { message: 'Calendrier généré avec succès', matchesCount: matches.length };
  }

}