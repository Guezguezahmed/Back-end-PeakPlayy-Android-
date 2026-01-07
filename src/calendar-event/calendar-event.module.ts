import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalendarEventService } from './calendar-event.service';
import { CalendarEventController } from './calendar-event.controller';
import { CalendarEvent, CalendarEventSchema } from '../schemas/calendar-event.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CalendarEvent.name, schema: CalendarEventSchema },
        ]),
    ],
    controllers: [CalendarEventController],
    providers: [CalendarEventService],
    exports: [CalendarEventService],
})
export class CalendarEventModule { }
