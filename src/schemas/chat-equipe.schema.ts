// src/schemas/chat-equipe.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// Assuming Equipe is located at src/schemas/equipe.schema
// Assuming User is located at src/schemas/user.schemas

@Schema({ timestamps: true }) 
export class ChatEquipe {
  
  // Reference to the Team (Equipe) this message belongs to
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Equipe', required: true })
  id_equipe: mongoose.Schema.Types.ObjectId; 

  // Reference to the User who sent the message
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  id_emetteur: mongoose.Schema.Types.ObjectId; 

  // The content of the message
  @Prop({ required: true })
  message: string;
  
  // Status: true = read by at least one member, false = unread (simplification for CRUD)
  // In a real chat, this would be { user: ObjectId, seenAt: Date }[]
  @Prop({ default: false })
  vue: boolean; 
}

export const ChatEquipeSchema = SchemaFactory.createForClass(ChatEquipe);