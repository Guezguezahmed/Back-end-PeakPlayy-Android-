import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Categorie, Equipe } from 'src/schemas/equipe.schema';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto, UpdateTeamMembersDto } from './dto/update-equipe.dto';
import { User } from 'src/schemas/user.schemas';

@Injectable()
export class EquipeService {
  constructor(
    @InjectModel(Equipe.name) private equipeModel: Model<Equipe>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  // **C**REATE
  async create(createEquipeDto: CreateEquipeDto): Promise<Equipe> {
    const newEquipe = new this.equipeModel(createEquipeDto);
    return newEquipe.save();
  }

  // **R**EAD All
  findAll(): Promise<Equipe[]> {
    return this.equipeModel
      .find()
      .populate('members', 'nom prenom')
      .exec();
  }

  // **R**EAD One
  findOne(id: string): Promise<Equipe | null> {
    return this.equipeModel
      .findById(id)
      .populate('members', 'nom prenom')
      .populate('starters', 'nom prenom')
      .populate('substitutes', 'nom prenom')
      .exec();
  }

  // **R**EAD By Academy
  findByAcademieId(academieId: string): Promise<Equipe[]> {
    return this.equipeModel
      .find({ id_academie: academieId })
      .exec();
  }

  // **U**PDATE (General)
  update(id: string, updateEquipeDto: UpdateEquipeDto): Promise<Equipe | null> {
    return this.equipeModel
      .findByIdAndUpdate(id, updateEquipeDto, {
        new: true,
        runValidators: true,
      })
      .populate('members', 'nom prenom')
      .exec();
  }

  // **U**PDATE (Add Member)
  async addMember(
    teamId: string,
    { playerId }: UpdateTeamMembersDto,
  ): Promise<Equipe> {
    const equipe = await this.equipeModel.findById(teamId).exec();
    if (!equipe) {
      throw new NotFoundException(`Équipe with ID ${teamId} not found.`);
    }

    if (equipe.members.map((id) => id.toString()).includes(playerId)) {
      throw new BadRequestException('Le joueur est déjà dans cette équipe.');
    }

    equipe.members.push(playerId as any);
    return equipe.save();
  }

  // **U**PDATE (Remove Member)
  async removeMember(teamId: string, { playerId }: UpdateTeamMembersDto): Promise<Equipe> {
    const equipe = await this.equipeModel.findById(teamId).exec();
    if (!equipe) {
      throw new NotFoundException(`Équipe with ID ${teamId} not found.`);
    }

    const initialLength = equipe.members.length;
    equipe.members = equipe.members.filter(id => id.toString() !== playerId) as mongoose.Schema.Types.ObjectId[];

    if (equipe.members.length === initialLength) {
      throw new NotFoundException('Le joueur n\'est pas membre de cette équipe.');
    }

    return equipe.save();
  }

  // **D**ELETE
  remove(id: string): Promise<any> {
    return this.equipeModel.findByIdAndDelete(id).exec();
  }

  // Find equipe by academy and category (with full stats)
  async findOneByAcademieAndCategorie(
    idAcademie: string,
    categorie: Categorie,
  ): Promise<Equipe | null> {
    return this.equipeModel
      .findOne({ id_academie: idAcademie, categorie })
      .exec();
  }


  // ===== EXTENDED METHODS FROM BackendDam-main ===== //

  async addJoueurToEquipe(idEquipe: string, idJoueur: string): Promise<Equipe> {
    const equipe = await this.equipeModel.findById(idEquipe).exec();
    if (!equipe)
      throw new NotFoundException(`Équipe avec ID ${idEquipe} introuvable`);

    const user = await this.userModel.findById(idJoueur).exec();
    if (!user)
      throw new NotFoundException(
        `Utilisateur avec ID ${idJoueur} introuvable`,
      );
    if (user.role !== 'JOUEUR') {
      throw new BadRequestException(
        `L'utilisateur ${idJoueur} n'a pas le rôle JOUEUR`,
      );
    }

    const joueurObjectId = new Types.ObjectId(idJoueur);

    if (!Array.isArray(equipe.members)) {
      equipe.members = [];
    }

    const exists = equipe.members.some((m: any) =>
      typeof m.equals === 'function'
        ? m.equals(joueurObjectId)
        : m.toString() === idJoueur,
    );
    if (!exists) {
      equipe.members.push(joueurObjectId as any);
      await equipe.save();
    }

    return equipe;
  }

  async addJoueurToAcademie(
    idAcademie: string,
    idJoueur: string,
    categorie: Categorie,
  ): Promise<Equipe> {
    const academieObjectId = new Types.ObjectId(idAcademie);
    const joueurObjectId = new Types.ObjectId(idJoueur);

    const user = await this.userModel.findById(idJoueur).exec();
    if (!user)
      throw new NotFoundException(`Utilisateur ${idJoueur} introuvable`);

    if (user.role !== 'JOUEUR') {
      throw new BadRequestException(
        `L'utilisateur ${idJoueur} n'a pas le rôle JOUEUR`,
      );
    }

    if (!Object.values(Categorie).includes(categorie)) {
      throw new BadRequestException(`Categorie invalide: ${categorie}`);
    }

    let equipe = await this.equipeModel
      .findOne({
        id_academie: academieObjectId,
        categorie: categorie,
      })
      .exec();

    if (!equipe) {
      equipe = new this.equipeModel({
        nom: `Equipe-${categorie}-${idAcademie}-${Date.now()}`,
        categorie: categorie,
        id_academie: academieObjectId,
        members: [joueurObjectId],
      } as any);

      await equipe.save();
      return equipe;
    }

    if (!Array.isArray(equipe.members)) {
      equipe.members = [];
    }

    const exists = equipe.members.some((m: any) =>
      typeof m.equals === 'function'
        ? m.equals(joueurObjectId)
        : m.toString() === idJoueur,
    );

    if (!exists) {
      equipe.members.push(joueurObjectId as any);
      await equipe.save();
    }

    return equipe;
  }

  async removeJoueurFromAcademie(
    idAcademie: string,
    idJoueur: string,
    categorie: Categorie,
  ): Promise<Equipe> {
    const academieObjectId = new Types.ObjectId(idAcademie);
    const joueurObjectId = new Types.ObjectId(idJoueur);

    const equipe = await this.equipeModel
      .findOne({
        id_academie: academieObjectId,
        categorie: categorie,
      })
      .exec();

    if (!equipe) {
      throw new NotFoundException(
        `Aucune équipe trouvée pour l'académie ${idAcademie} dans la catégorie ${categorie}`,
      );
    }

    const beforeCount = equipe.members.length;

    equipe.members = equipe.members.filter((m: any) =>
      typeof m.equals === 'function'
        ? !m.equals(joueurObjectId)
        : m.toString() !== idJoueur,
    );

    if (equipe.members.length === beforeCount) {
      throw new NotFoundException(
        `Le joueur ${idJoueur} n'appartient pas à l'équipe de catégorie ${categorie}`,
      );
    }

    await equipe.save();
    return equipe;
  }

  async addStarterToEquipe(
    idAcademie: string,
    idJoueur: string,
    categorie: Categorie,
  ): Promise<Equipe> {
    const academieObjectId = new Types.ObjectId(idAcademie);
    const joueurObjectId = new Types.ObjectId(idJoueur);

    const equipe = await this.equipeModel
      .findOne({
        id_academie: academieObjectId,
        categorie: categorie,
      })
      .exec();

    if (!equipe) {
      throw new NotFoundException(
        `Aucune équipe trouvée pour l'académie ${idAcademie} dans la catégorie ${categorie}`,
      );
    }

    const isMember = equipe.members.some((m) => m.toString() === idJoueur);
    if (!isMember) {
      throw new BadRequestException(
        `Le joueur ${idJoueur} n'appartient pas à cette équipe`,
      );
    }

    if (!Array.isArray(equipe.starters)) {
      equipe.starters = [];
    }

    const isAlreadyStarter = equipe.starters.some((t) =>
      t.toString() === idJoueur,
    );
    if (!isAlreadyStarter) {
      equipe.starters.push(joueurObjectId as any);
      await equipe.save();
    }

    return equipe;
  }

  async addSubstituteToEquipe(
    idAcademie: string,
    idJoueur: string,
    categorie: Categorie,
  ): Promise<Equipe> {
    const academieObjectId = new Types.ObjectId(idAcademie);
    const joueurObjectId = new Types.ObjectId(idJoueur);

    const equipe = await this.equipeModel
      .findOne({
        id_academie: academieObjectId,
        categorie: categorie,
      })
      .exec();

    if (!equipe) {
      throw new NotFoundException(
        `Aucune équipe trouvée pour l'académie ${idAcademie} dans la catégorie ${categorie}`,
      );
    }

    const isMember = equipe.members.some((m) => m.toString() === idJoueur);
    if (!isMember) {
      throw new BadRequestException(
        `Le joueur ${idJoueur} n'appartient pas à cette équipe`,
      );
    }

    if (!Array.isArray(equipe.substitutes)) {
      equipe.substitutes = [];
    }

    const isAlreadySubstitute = equipe.substitutes.some((r) =>
      r.toString() === idJoueur,
    );
    if (!isAlreadySubstitute) {
      equipe.substitutes.push(joueurObjectId as any);
      await equipe.save();
    }

    return equipe;
  }

  async swapPlayers(
    idAcademie: string,
    id1: string,
    id2: string,
    categorie: Categorie,
  ): Promise<Equipe> {
    const academieObjectId = new Types.ObjectId(idAcademie);
    const objId1 = new Types.ObjectId(id1);
    const objId2 = new Types.ObjectId(id2);

    const equipe = await this.equipeModel
      .findOne({
        id_academie: academieObjectId,
        categorie: categorie,
      })
      .exec();

    if (!equipe) {
      throw new NotFoundException(
        `Aucune équipe trouvée pour l'académie ${idAcademie} dans la catégorie ${categorie}`,
      );
    }

    equipe.starters = equipe.starters || [];
    equipe.substitutes = equipe.substitutes || [];

    let idx1 = equipe.starters.findIndex((t) => t.toString() === id1);
    let idx2 = equipe.starters.findIndex((t) => t.toString() === id2);
    let array1: mongoose.Schema.Types.ObjectId[] = equipe.starters;
    let array2: mongoose.Schema.Types.ObjectId[] = equipe.starters;

    if (idx1 === -1) {
      idx1 = equipe.substitutes.findIndex((r) => r.toString() === id1);
      if (idx1 === -1)
        throw new BadRequestException(
          `Le joueur ${id1} n'existe pas dans l'équipe`,
        );
      array1 = equipe.substitutes;
    }

    if (idx2 === -1) {
      idx2 = equipe.substitutes.findIndex((r) => r.toString() === id2);
      if (idx2 === -1)
        throw new BadRequestException(
          `Le joueur ${id2} n'existe pas dans l'équipe`,
        );
      array2 = equipe.substitutes;
    }

    const temp = array1[idx1];
    array1[idx1] = array2[idx2];
    array2[idx2] = temp;

    await equipe.save();
    return equipe;
  }

  async searchJoueursStarterOrSubstitute(
    idAcademie: string,
    categorie: Categorie,
    query: string,
  ) {
    const regex = new RegExp(query, 'i');
    const academieObjectId = new Types.ObjectId(idAcademie);

    const equipe = await this.equipeModel
      .findOne({
        id_academie: academieObjectId,
        categorie: categorie,
      })
      .exec();

    if (!equipe) {
      throw new NotFoundException(
        `Aucune équipe trouvée pour cette académie + catégorie`,
      );
    }

    const joueursIds = [
      ...(equipe.starters ?? []),
      ...(equipe.substitutes ?? []),
    ];

    if (joueursIds.length === 0) return [];

    const results = await this.userModel
      .find({
        _id: { $in: joueursIds },
        $or: [{ nom: regex }, { prenom: regex }, { email: regex }],
      })
      .exec();

    return results;
  }

  async getJoueursByRole(
    idAcademie: string,
    categorie: Categorie,
    role: 'starter' | 'substitute',
  ) {
    const academieObjectId = new Types.ObjectId(idAcademie);

    const equipe = await this.equipeModel
      .findOne({
        id_academie: academieObjectId,
        categorie: categorie,
      })
      .exec();

    if (!equipe) {
      throw new NotFoundException(
        `Aucune équipe trouvée pour l'académie ${idAcademie} dans la catégorie ${categorie}`,
      );
    }

    let joueursIds: mongoose.Schema.Types.ObjectId[] = [];

    if (role === 'starter') {
      joueursIds = equipe.starters ?? [];
    } else if (role === 'substitute') {
      joueursIds = equipe.substitutes ?? [];
    } else {
      throw new BadRequestException(
        `Role invalide: ${role}. Utiliser 'starter' ou 'substitute'.`,
      );
    }

    if (joueursIds.length === 0) return [];

    const joueurs = await this.userModel
      .find({ _id: { $in: joueursIds } })
      .select('nom prenom email')
      .exec();

    const joueursOrdonnes = joueursIds
      .map((id) => joueurs.find((j) => j._id.toString() === id.toString()))
      .filter((j) => j !== null && j !== undefined) as any[];

    return joueursOrdonnes;
  }

  async getAllMembresByAcademieCategorie(
    idAcademie: string,
    categorie: Categorie,
  ) {
    const academieObjectId = new Types.ObjectId(idAcademie);

    const equipe = await this.equipeModel
      .findOne({
        id_academie: academieObjectId,
        categorie: categorie,
      })
      .exec();

    if (!equipe) {
      throw new NotFoundException(
        `Aucune équipe trouvée pour l'académie ${idAcademie} dans la catégorie ${categorie}`,
      );
    }

    const membresIds = equipe.members ?? [];

    if (membresIds.length === 0) return [];

    const membres = await this.userModel
      .find({ _id: { $in: membresIds } })
      .select('nom prenom email picture poste numero_prefere rating')
      .exec();

    // Map members with jersey numbers from maillots array
    const membresOrdonnes = membresIds
      .map((id) => {
        const membre = membres.find((m) => m._id.toString() === id.toString());
        if (!membre) return null;

        // Find assigned jersey number from equipe.maillots
        const jerseyAssignment = equipe.maillots?.find(
          (m) => m.id_joueur.toString() === id.toString()
        );

        // Return member with jersey number (use assigned or preferred)
        return {
          ...membre.toObject(),
          numero: jerseyAssignment?.numero?.toString() || membre['numero_prefere']?.toString() || '10',
          poste: membre['poste'] || 'Forward'
        };
      })
      .filter((m) => m !== null && m !== undefined) as any[];

    return membresOrdonnes;
  }

  async getMembersByTeamId(teamId: string) {
    const equipe = await this.equipeModel.findById(teamId).exec();

    if (!equipe) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const membresIds = equipe.members ?? [];

    if (membresIds.length === 0) return [];

    const membres = await this.userModel
      .find({ _id: { $in: membresIds } })
      .select('nom prenom email picture poste numero_prefere rating')
      .exec();

    // Map members with jersey numbers from maillots array
    const membresOrdonnes = membresIds
      .map((id) => {
        const membre = membres.find((m) => m._id.toString() === id.toString());
        if (!membre) return null;

        // Find assigned jersey number from equipe.maillots
        const jerseyAssignment = equipe.maillots?.find(
          (m) => m.id_joueur.toString() === id.toString()
        );

        // Return member with jersey number (use assigned or preferred)
        return {
          ...membre.toObject(),
          numero: jerseyAssignment?.numero?.toString() || membre['numero_prefere']?.toString() || '10',
          poste: membre['poste'] || 'Forward'
        };
      })
      .filter((m) => m !== null && m !== undefined) as any[];

    return membresOrdonnes;
  }

  // Get starters by academy and category
  async getStartersByAcademieCategorie(
    idAcademie: string,
    categorie: Categorie,
  ) {
    return this.getJoueursByRole(idAcademie, categorie, 'starter');
  }

  // Get substitutes by academy and category
  async getSubstitutesByAcademieCategorie(
    idAcademie: string,
    categorie: Categorie,
  ) {
    return this.getJoueursByRole(idAcademie, categorie, 'substitute');
  }

  // ---------------- AGGREGATE STATS FOR COACH PROFILE ----------------
  async getAcademyStats(idAcademie: string) {
    const teams = await this.equipeModel.find({ id_academie: idAcademie }).exec();

    let totalMatches = 0;
    let totalWins = 0;
    let totalPlayers = 0;

    teams.forEach(team => {
      // Sum matches and wins from stats
      if (team.stats) {
        totalMatches += team.stats.total_matches || 0;
        totalWins += team.stats.wins || 0;
      }
      // Sum players (starters + substitutes + members that are not assigned)
      // Actually members should contain all unique players
      if (team.members) {
        totalPlayers += team.members.length;
      }
    });

    const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(0) + '%' : '0%';

    return {
      teams: teams.length,
      matches: totalMatches,
      players: totalPlayers,
      wins: totalWins,
      winRate: winRate
    };
  }
}