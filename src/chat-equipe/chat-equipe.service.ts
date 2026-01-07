// src/chat-equipe/chat-equipe.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatEquipe } from 'src/schemas/chat-equipe.schema';
import { CreateChatEquipeDto } from './dto/create-chat-equipe.dto';
import { UpdateChatEquipeDto } from './dto/update-chat-equipe.dto';

@Injectable()
export class ChatEquipeService {
  constructor(@InjectModel(ChatEquipe.name) private chatEquipeModel: Model<ChatEquipe>) {}

  // **C**REATE
  async create(createChatEquipeDto: CreateChatEquipeDto): Promise<ChatEquipe> {
    const newChatEquipe = new this.chatEquipeModel(createChatEquipeDto);
    return newChatEquipe.save();
  }

  // **R**EAD All (Admin/Owner audit)
  findAll(): Promise<ChatEquipe[]> {
    return this.chatEquipeModel
      .find()
      .populate('id_equipe', 'nom') // Show which team
      .populate('id_emetteur', 'nom prenom') // Show who sent it
      .exec();
  }
  
  // Custom Read: Get chat history for a specific team
  findTeamChat(equipeId: string): Promise<ChatEquipe[]> {
    return this.chatEquipeModel
      .find({ id_equipe: equipeId })
      .sort({ createdAt: 1 }) // Order by time sent
      .populate('id_emetteur', 'nom prenom')
      .exec();
  }

  // **R**EAD One
  findOne(id: string): Promise<ChatEquipe | null> {
    return this.chatEquipeModel.findById(id).exec();
  }

  // **U**PDATE (Mark as read or edit)
  update(id: string, updateChatEquipeDto: UpdateChatEquipeDto): Promise<ChatEquipe | null> {
    return this.chatEquipeModel
      .findByIdAndUpdate(id, updateChatEquipeDto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  // **D**ELETE
  remove(id: string): Promise<any> {
    return this.chatEquipeModel.findByIdAndDelete(id).exec();
  }
}