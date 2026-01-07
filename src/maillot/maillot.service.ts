import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Equipe, EquipeDocument } from 'src/schemas/equipe.schema';

// Type pour un membre populé
interface PopulatedUser {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
}

@Injectable()
export class MaillotService {
    constructor(
        @InjectModel(Equipe.name) private equipeModel: Model<EquipeDocument>,
    ) { }

    // ----------- GET joueur + numéro ----------
    async getJoueurMaillot(idJoueur: string, idAcademie: string) {
        const equipe = await this.equipeModel
            .findOne({ id_academie: new Types.ObjectId(idAcademie) })
            .populate<{ members: PopulatedUser[] }>('members')
            .exec();

        if (!equipe) throw new NotFoundException("Aucune équipe trouvée pour cette académie");

        const joueur = equipe.members.find(m => m._id.toString() === idJoueur);
        if (!joueur) throw new NotFoundException("Joueur non trouvé dans cette académie");

        const entry = equipe.maillots.find(m => m.id_joueur.toString() === idJoueur);

        return {
            nom: joueur.nom,
            prenom: joueur.prenom,
            email: joueur.email,
            numero: entry ? entry.numero : null, // null si pas de maillot
        };
    }

    // ----------- ASSIGN ----------
    async assignMaillot(idJoueur: string, idAcademie: string, numero: number) {
        const equipe = await this.equipeModel.findOne({ id_academie: new Types.ObjectId(idAcademie) });
        if (!equipe) throw new NotFoundException("Équipe non trouvée");

        const existing = equipe.maillots.find(m => m.id_joueur.toString() === idJoueur);
        if (existing) throw new BadRequestException("Ce joueur a déjà un numéro de maillot");

        const numeroPris = equipe.maillots.some(m => m.numero === numero);
        if (numeroPris) throw new BadRequestException("Ce numéro est déjà utilisé");

        equipe.maillots.push({
            id_joueur: new Types.ObjectId(idJoueur),
            numero,
        });

        await equipe.save();
        return { message: "Numéro attribué avec succès" };
    }

    // ----------- UPDATE ----------
    async updateMaillot(idJoueur: string, idAcademie: string, numero: number) {
        const equipe = await this.equipeModel.findOne({ id_academie: new Types.ObjectId(idAcademie) });
        if (!equipe) throw new NotFoundException("Équipe non trouvée");

        // Cherche si le joueur a déjà un numéro
        let entry = equipe.maillots.find(m => m.id_joueur.toString() === idJoueur);

        // Vérifie si le numéro est déjà utilisé par un autre joueur
        const numeroPris = equipe.maillots.some(
            m => m.numero === numero && m.id_joueur.toString() !== idJoueur
        );
        if (numeroPris) throw new BadRequestException("Ce numéro est déjà utilisé par un autre joueur");

        if (entry) {
            // Le joueur avait déjà un numéro → update
            entry.numero = numero;
            await equipe.save();
            return { message: "Numéro modifié avec succès" };
        } else {
            // Le joueur n'avait pas de numéro → affectation
            equipe.maillots.push({ id_joueur: new Types.ObjectId(idJoueur), numero });
            await equipe.save();
            return { message: "Numéro attribué avec succès" };
        }
    }


    // ----------- DELETE ----------
    async removeMaillot(idJoueur: string, idAcademie: string) {
        const equipe = await this.equipeModel.findOne({ id_academie: new Types.ObjectId(idAcademie) });
        if (!equipe) throw new NotFoundException("Équipe non trouvée");

        const before = equipe.maillots.length;
        equipe.maillots = equipe.maillots.filter(m => m.id_joueur.toString() !== idJoueur);

        if (equipe.maillots.length === before) {
            throw new NotFoundException("Ce joueur n'a pas de numéro de maillot");
        }

        await equipe.save();
        return { message: "Numéro supprimé avec succès" };
    }
}
