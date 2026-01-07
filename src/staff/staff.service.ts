import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
  ) { }

  // ---------------- CREATE ----------------
  async create(createStaffDto: CreateStaffDto) {
    const staff = new this.staffModel(createStaffDto);
    return staff.save();
  }

  // ---------------- FIND ALL ----------------
  async findAll() {
    return this.staffModel.find().exec();
  }

  // ---------------- FIND ONE ----------------
  async findOne(id: string) {
    const staff = await this.staffModel.findById(id).exec();
    if (!staff) throw new NotFoundException('Staff introuvable');
    return staff;
  }

  // ---------------- UPDATE ----------------
  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const staff = await this.staffModel.findByIdAndUpdate(
      id,
      updateStaffDto,
      { new: true },
    );
    if (!staff) throw new NotFoundException('Staff introuvable');
    return staff;
  }

  // ---------------- REMOVE ----------------
  async remove(id: string) {
    const result = await this.staffModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Staff introuvable');
    return { message: 'Staff supprimé avec succès', id };
  }



  async addArbitreToAcademie(idAcademie: string, idArbitre: string) {
    // Cherche le staff par id_academie
    const staff = await this.staffModel.findOne({ id_academie: idAcademie }).exec();

    if (!staff) {
      throw new NotFoundException('Staff pour cette académie introuvable');
    }

    const arbitreObjectId = new Types.ObjectId(idArbitre);

    // Vérifie si l'arbitre est déjà dans la liste
    if (!staff.id_arbitres.some(a => a.equals(arbitreObjectId))) {
      staff.id_arbitres.push(arbitreObjectId);
      await staff.save();
    }

    return staff;
  }

  // ---------------- FIND ARBITRES BY ACADEMIE ----------------
  async getArbitresByAcademie(idAcademie: string) {
    // Cherche le staff par id_academie et populate les arbitres
    const staff = await this.staffModel
      .findOne({ id_academie: idAcademie })
      .populate('id_arbitres') // Popule les infos complètes des arbitres depuis la collection User
      .exec();

    if (!staff) {
      throw new NotFoundException('Staff pour cette académie introuvable');
    }

    return staff.id_arbitres; // Retourne le tableau des arbitres
  }
  ////////////////////////delete arbitre from academie///////////////////////
  async removeArbitreFromAcademie(idAcademie: string, idArbitre: string) {
    // Cherche le staff par id_academie
    const staff = await this.staffModel.findOne({ id_academie: idAcademie }).exec();

    if (!staff) {
      throw new NotFoundException('Staff pour cette académie introuvable');
    }

    const arbitreObjectId = new Types.ObjectId(idArbitre);

    // Filtre : garde uniquement ceux QUI NE SONT PAS égaux
    staff.id_arbitres = staff.id_arbitres.filter(a => !a.equals(arbitreObjectId));

    await staff.save();

    return staff;
  }
  async isArbitreInAcademie(idAcademie: string, idArbitre: string): Promise<boolean> {
    const staff = await this.staffModel
      .findOne({ id_academie: idAcademie })
      .exec();

    if (!staff) {
      throw new NotFoundException('Staff pour cette académie introuvable');
    }

    const arbitreObjectId = new Types.ObjectId(idArbitre);

    // Vérifie si l'arbitre existe dans la liste
    return staff.id_arbitres.some(a => a.equals(arbitreObjectId));
  }

  // ============== COACH RECRUITMENT METHODS ==============

  // ---------------- ADD COACH TO ACADEMIE ----------------
  async addCoachToAcademie(idAcademie: string, idCoach: string) {
    const staff = await this.staffModel.findOne({ id_academie: idAcademie }).exec();

    if (!staff) {
      throw new NotFoundException('Staff pour cette académie introuvable');
    }

    const coachObjectId = new Types.ObjectId(idCoach);

    // Vérifie si le coach est déjà dans la liste
    if (!staff.id_coaches.some(c => c.equals(coachObjectId))) {
      staff.id_coaches.push(coachObjectId);
      await staff.save();
    }

    return staff;
  }

  // ---------------- FIND COACHES BY ACADEMIE ----------------
  async getCoachesByAcademie(idAcademie: string) {
    const staff = await this.staffModel
      .findOne({ id_academie: idAcademie })
      .populate('id_coaches') // Popule les infos complètes des coaches depuis la collection User
      .exec();

    if (!staff) {
      throw new NotFoundException('Staff pour cette académie introuvable');
    }

    return staff.id_coaches; // Retourne le tableau des coaches
  }

  // ---------------- REMOVE COACH FROM ACADEMIE ----------------
  async removeCoachFromAcademie(idAcademie: string, idCoach: string) {
    const staff = await this.staffModel.findOne({ id_academie: idAcademie }).exec();

    if (!staff) {
      throw new NotFoundException('Staff pour cette académie introuvable');
    }

    const coachObjectId = new Types.ObjectId(idCoach);

    // Filtre : garde uniquement ceux QUI NE SONT PAS égaux
    staff.id_coaches = staff.id_coaches.filter(c => !c.equals(coachObjectId));

    await staff.save();

    return staff;
  }

  // ---------------- CHECK IF COACH EXISTS IN ACADEMIE ----------------
  async isCoachInAcademie(idAcademie: string, idCoach: string): Promise<boolean> {
    const staff = await this.staffModel
      .findOne({ id_academie: idAcademie })
      .exec();

    if (!staff) {
      throw new NotFoundException('Staff pour cette académie introuvable');
    }

    const coachObjectId = new Types.ObjectId(idCoach);

    // Vérifie si le coach existe dans la liste
    return staff.id_coaches.some(c => c.equals(coachObjectId));
  }


  // ---------------- FIND STAFF BY MEMBER (Arbitre or Coach) ----------------
  async findStaffByMember(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const staff = await this.staffModel.findOne({
      $or: [
        { id_arbitres: userObjectId },
        { id_coaches: userObjectId }
      ]
    })
      .populate('id_arbitres', 'prenom nom avatar picture rating role')
      .populate('id_coaches', 'prenom nom avatar picture rating role')
      .populate('id_academie', 'nom logo')
      .exec();

    return staff;
  }

  // ---------------- FIND STAFF BY COACH ID ----------------
  async findStaffByCoach(coachId: string) {
    // USE NATIVE COLLECTION to bypass Mongoose Schema casting
    // The id_coaches array contains mixed types (Strings and ObjectIds)
    // Mongoose schema enforces ObjectId which breaks querying for strings

    // We search for the coachId as a string AND as an ObjectId
    const staff = await this.staffModel.collection.findOne({
      id_coaches: {
        $in: [coachId, new Types.ObjectId(coachId)]
      }
    });

    return staff;
  }
}
