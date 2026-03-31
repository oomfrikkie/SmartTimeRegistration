import { Controller, Post, Get, Body, Query, Param, ParseIntPipe } from '@nestjs/common';
import { EventByEmailResponseDto } from './dto-event/event-by-email-response.dto';
import { EventService } from './event.service';
import { AddEventDto } from './dto-event/add-event.dto';
import { Event } from './event.entity';
import { get } from 'http';

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

  @Get('email')
  async getEventByEmail(@Query('email') email: string): Promise<EventByEmailResponseDto[]> {
    return this.eventService.getEventByEmail(email);
  }

  @Get(':account_id')
  async getEventByAccountIdTextFiltered(
    @Param('account_id', ParseIntPipe) account_id: number,
    @Query('project_name') project_name?: string,
  ): Promise<Event[]> {
    return await this.eventService.getEventByAccountIdTextFiltered({
      account_id,
      project_name,
    });
  }
}
