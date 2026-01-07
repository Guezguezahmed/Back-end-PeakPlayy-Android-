import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CalendarEvent, CalendarEventDocument } from '../schemas/calendar-event.schema';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/create-calendar-event.dto';

@Injectable()
export class CalendarEventService {
    constructor(
        @InjectModel(CalendarEvent.name)
        private calendarEventModel: Model<CalendarEventDocument>,
    ) { }

    async create(createDto: CreateCalendarEventDto): Promise<CalendarEvent> {
        const createdEvent = new this.calendarEventModel({
            ...createDto,
            userId: new Types.ObjectId(createDto.userId),
            date: new Date(createDto.date),
        });
        return createdEvent.save();
    }

    async findAllByUserId(userId: string): Promise<CalendarEvent[]> {
        return this.calendarEventModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ date: 1, startTime: 1 })
            .exec();
    }

    async findByUserIdAndMonth(
        userId: string,
        year: number,
        month: number,
    ): Promise<CalendarEvent[]> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        return this.calendarEventModel
            .find({
                userId: new Types.ObjectId(userId),
                date: { $gte: startDate, $lte: endDate },
            })
            .sort({ date: 1, startTime: 1 })
            .exec();
    }

    async findByUserIdAndDate(
        userId: string,
        date: string,
    ): Promise<CalendarEvent[]> {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        return this.calendarEventModel
            .find({
                userId: new Types.ObjectId(userId),
                date: { $gte: startOfDay, $lte: endOfDay },
            })
            .sort({ startTime: 1 })
            .exec();
    }

    async findOne(id: string): Promise<CalendarEvent | null> {
        return this.calendarEventModel.findById(id).exec();
    }

    async update(
        id: string,
        updateDto: UpdateCalendarEventDto,
    ): Promise<CalendarEvent | null> {
        const updateData: any = { ...updateDto };
        if (updateDto.date) {
            updateData.date = new Date(updateDto.date);
        }
        return this.calendarEventModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
    }

    async remove(id: string): Promise<CalendarEvent | null> {
        return this.calendarEventModel.findByIdAndDelete(id).exec();
    }
}
