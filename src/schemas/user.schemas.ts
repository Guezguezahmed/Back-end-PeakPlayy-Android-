import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {

  @Prop({ required: false })
  prenom: string;

  @Prop({ required: false })
  nom: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  age: Date;

  @Prop({ required: false })
  tel: number;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['JOUEUR', 'OWNER', 'ARBITRE', 'COACH'], default: 'JOUEUR' })
  role: string;

  // Player-specific fields (only relevant for JOUEUR role)
  @Prop({
    required: false,
    enum: ['Undefined', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Gardien', 'Défenseur', 'Milieu', 'Attaquant'],
    default: 'Undefined'
  })
  poste?: string; // Position

  @Prop({ required: false, min: 0, max: 99, default: 0 })
  numero_prefere?: number; // Preferred jersey number (0 = unassigned)

  @Prop({ required: false, min: 1, max: 100, default: 50 })
  rating?: number; // Player overall rating (1-100)

  @Prop({ required: false })
  provider?: string;

  @Prop({ required: false })
  providerId?: string;

  @Prop({ required: false, default: false })
  emailVerified?: boolean;

  // Email verification fields
  @Prop({ type: String, default: null })
  verificationCode: string | null;

  @Prop({ type: Date, default: null })
  codeExpiresAt: Date | null;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ required: false })
  picture: string;

  @Prop({ type: String, default: null })
  avatar: string; // Supabase image URL
}

export const UserSchema = SchemaFactory.createForClass(User);
