import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { AddEventDto } from './dto-event/add-event.dto';
import { Event } from './event.entity';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('')
  async addEvent(@Body() dto: AddEventDto): Promise<any> {
    return this.eventService.addEvent(dto);
  }

  @Get('')
  async getEventByAccountId(@Query('account_id') account_id: string): Promise<any> {
    return this.eventService.getEventByAccountId(Number(account_id));
  }
  
}
