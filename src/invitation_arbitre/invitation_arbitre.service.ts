import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvitationArbitre, InvitationArbitreDocument } from 'src/schemas/invitation-arbitre.schema';
import { CreateInvitationArbitreDto } from './dto/create-invitation_arbitre.dto';
import { UpdateInvitationArbitreDto } from './dto/update-invitation_arbitre.dto';


@Injectable()
export class InvitationArbitreService {
  constructor(
    @InjectModel(InvitationArbitre.name)
    private invitationArbitreModel: Model<InvitationArbitreDocument>,
  ) {}

  // ---------------- CREATE ----------------
  async create(createInvitationArbitreDto: CreateInvitationArbitreDto) {
    const invitation = new this.invitationArbitreModel(createInvitationArbitreDto);
    return invitation.save();
  }

  // ---------------- FIND ALL ----------------
  async findAll() {
    return this.invitationArbitreModel.find().exec();
  }

  // ---------------- FIND ONE ----------------
  async findOne(id: string) {
    const invitation = await this.invitationArbitreModel.findById(id).exec();
    if (!invitation) throw new NotFoundException('Invitation introuvable');
    return invitation;
  }

  // ---------------- UPDATE ----------------
  async update(id: string, updateInvitationArbitreDto: UpdateInvitationArbitreDto) {
    const invitation = await this.invitationArbitreModel.findByIdAndUpdate(
      id,
      updateInvitationArbitreDto,
      { new: true },
    );
    if (!invitation) throw new NotFoundException('Invitation introuvable');
    return invitation;
  }

  // ---------------- REMOVE ----------------
  async remove(id: string) {
    const invitation = await this.invitationArbitreModel.findByIdAndDelete(id);
    if (!invitation) throw new NotFoundException('Invitation introuvable');
    return { message: 'Invitation supprimée avec succès', id };
  }


  //change value of vu
  async toggleVu(id: string) {
  const invitation = await this.invitationArbitreModel.findById(id).exec();
  if (!invitation) {
    throw new NotFoundException('Invitation introuvable');
  }
  // Inverse la valeur de "vu"
  invitation.vu = !invitation.vu;
  await invitation.save();
  return invitation;
}
async markAsVu(id: string) {
  const invitation = await this.invitationArbitreModel.findById(id).exec();
  if (!invitation) {
    throw new NotFoundException('Invitation introuvable');
  }

  // Met "vu" à true
  invitation.vu = true;
  await invitation.save();

  return invitation;
}
async findByArbitre(idArbitre: string) {
  const invitations = await this.invitationArbitreModel
    .find({ id_arbitre: idArbitre })
    .exec();

  if (!invitations || invitations.length === 0) {
    throw new NotFoundException('Aucune invitation trouvée pour cet arbitre');
  }

  return invitations;
}
}
