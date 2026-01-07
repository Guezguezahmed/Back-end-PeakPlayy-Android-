import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { CalendarEventService } from './calendar-event.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/create-calendar-event.dto';

@Controller('calendar-events')
export class CalendarEventController {
    constructor(private readonly calendarEventService: CalendarEventService) { }

    @Post()
    create(@Body() createDto: CreateCalendarEventDto) {
        return this.calendarEventService.create(createDto);
    }

    @Get('user/:userId')
    findAllByUser(@Param('userId') userId: string) {
        return this.calendarEventService.findAllByUserId(userId);
    }

    @Get('user/:userId/month/:year/:month')
    findByMonth(
        @Param('userId') userId: string,
        @Param('year') year: string,
        @Param('month') month: string,
    ) {
        return this.calendarEventService.findByUserIdAndMonth(
            userId,
            parseInt(year),
            parseInt(month),
        );
    }

    @Get('user/:userId/date/:date')
    findByDate(
        @Param('userId') userId: string,
        @Param('date') date: string,
    ) {
        return this.calendarEventService.findByUserIdAndDate(userId, date);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.calendarEventService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateDto: UpdateCalendarEventDto,
    ) {
        return this.calendarEventService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.calendarEventService.remove(id);
    }
}
