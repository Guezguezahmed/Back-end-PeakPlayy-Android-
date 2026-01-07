// staff.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  id_academie: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  id_arbitres: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  id_coaches: Types.ObjectId[];
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
