// invitation-arbitre.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvitationArbitreDocument = InvitationArbitre & Document;

@Schema({ timestamps: true })
export class InvitationArbitre {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  id_academie: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  id_arbitre: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  vu: boolean;
}

export const InvitationArbitreSchema = SchemaFactory.createForClass(InvitationArbitre);
