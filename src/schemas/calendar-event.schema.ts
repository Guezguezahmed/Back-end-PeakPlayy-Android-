import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CalendarEventDocument = CalendarEvent & Document;

@Schema({ timestamps: true })
export class CalendarEvent {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: false, default: '' })
    location: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    startTime: string; // Format: "HH:mm" e.g., "09:00"

    @Prop({ required: false, default: '' })
    endTime: string; // Format: "HH:mm" e.g., "10:00"

    @Prop({ required: false, default: '#84CC16' })
    color: string; // Hex color for event card

    @Prop({ required: false, default: 'other' })
    type: string; // Custom types allowed: training, match, meeting, other, etc.

    @Prop({ required: false, default: '' })
    description: string;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);

// Index for efficient queries by user and date
CalendarEventSchema.index({ userId: 1, date: 1 });
