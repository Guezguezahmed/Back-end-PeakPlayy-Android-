// src/messages/messages.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'src/schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

// Mongoose returns a Document type which includes utility methods and fields like _id,
// but for service methods where the return is optional (like findOne), we should
// explicitly use the Document type or allow for 'null'. 
type MessageDocument = Message & Document; // Using a type alias for clarity

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  // **C**REATE
  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = new this.messageModel(createMessageDto);
    return newMessage.save();
  }

  // **R**EAD All
  findAll(): Promise<Message[]> {
    return this.messageModel
      .find()
      .populate('id_emetteur', 'nom prenom')
      .populate('id_destinataire', 'nom prenom')
      .exec();
  }
  
  // Custom Read: Get messages between two specific users (Chat History)
  findConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { id_emetteur: userId1, id_destinataire: userId2 },
          { id_emetteur: userId2, id_destinataire: userId1 },
        ],
      })
      .sort({ createdAt: 1 })
      .populate('id_emetteur', 'nom prenom')
      .exec();
  }

  // **R**EAD: Get a single message by ID
  // FIX: Allowing 'null' in the return type
  findOne(id: string): Promise<Message | null> {
    return this.messageModel.findById(id).exec();
  }

  // **U**PDATE
  // FIX: Allowing 'null' in the return type
  update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message | null> {
    return this.messageModel
      .findByIdAndUpdate(id, updateMessageDto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  // **D**ELETE
  // FIX: Allowing 'null' in the return type (for Mongoose result when not found)
  remove(id: string): Promise<any> { // Note: Mongoose delete returns a different type (DeleteResult)
    return this.messageModel.findByIdAndDelete(id).exec();
  }
}