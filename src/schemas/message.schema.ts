import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schemas'; // Corrected path to point to the shared schemas folder

// We assume the User schema file is correctly located at src/schemas/user.schemas.ts
// The 'User' reference here matches the name used in your MongooseModule.forFeature in users.module.ts

@Schema({ timestamps: true })
export class Message {
  // Reference to the User who sent the message
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  id_emetteur: mongoose.Schema.Types.ObjectId; // Changed type for clarity

  // Reference to the User who receives the message
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  id_destinataire: mongoose.Schema.Types.ObjectId; // Changed type for clarity

  // Status of the message: read or unread
  @Prop({ default: false })
  vue: boolean; // 'vue' means 'seen' (read)

  // The content of the message
  @Prop({ required: true })
  message: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);