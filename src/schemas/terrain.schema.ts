import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Terrain {
  // Reference to the Academy owner (e.g., the User/OWNER entity ID)
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  id_academie: mongoose.Schema.Types.ObjectId;

  // Stadium name
  @Prop({ required: true })
  name: string;

  // The physical location/address of the terrain (verbal)
  @Prop({ required: true })
  location_verbal: string;

  // GPS coordinates
  @Prop({
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    required: true,
  })
  coordinates: {
    latitude: number;
    longitude: number;
  };

  // Capacity & Infrastructure
  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  number_of_fields: number;

  @Prop({ type: [String], default: [] })
  field_names: string[];

  // Optional features
  @Prop({ default: false })
  has_lights: boolean;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  // Availability
  @Prop({ default: true })
  is_available: boolean;
}

export const TerrainSchema = SchemaFactory.createForClass(Terrain);