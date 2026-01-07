// src/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// Assuming User is located at src/schemas/user.schemas
// If the emitter is the system, you might use a special fixed ID or make it optional.
// For now, we assume user-to-user or user-to-system notifications.

@Schema({ timestamps: true }) 
export class Notification {
  
  // Reference to the User who sent the notification (can be system or another user)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  id_emetteur?: mongoose.Schema.Types.ObjectId;

  // Reference to the User who receives the notification
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  id_destinataire: mongoose.Schema.Types.ObjectId; 

  // Status: true = read, false = unread
  @Prop({ default: false })
  vue: boolean; 

  // The content of the notification (e.g., "Your match is scheduled")
  @Prop({ required: true })
  message: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);