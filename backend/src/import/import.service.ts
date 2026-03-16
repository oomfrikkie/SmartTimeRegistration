import { Injectable } from '@nestjs/common';
import ICAL from 'ical.js';
import { EventService } from '../event/event.service';

@Injectable()
export class ImportService {
  constructor(private readonly eventService: EventService) {}

  async importAndSaveEvents(
    icsUrl: string,
    start_date: Date,
    end_date: Date,
    account_id: number,
  ) {
    if (!start_date || !end_date) {
      return { message: 'No dates selected' };
    }

    const response = await fetch(icsUrl);
    const icsText = await response.text();

    const parsed = ICAL.parse(icsText);
    const component = new ICAL.Component(parsed);
    const events = component.getAllSubcomponents('vevent');

    const filterStart = new Date(`${start_date}T00:00:00`);
    const filterEnd = new Date(`${end_date}T23:59:59.999`);

    const filtered = events
      .filter((event) => {
        const vevent = new ICAL.Event(event);
        const eventDate = vevent.startDate.toJSDate();

        return eventDate >= filterStart && eventDate <= filterEnd;
      })
      .map((event) => {
        const vevent = new ICAL.Event(event);
        const startTime = vevent.startDate;
        const endTime = vevent.endDate;

        const durationHours =
          (endTime.toUnixTime() - startTime.toUnixTime()) / 3600;

        return {
          name: vevent.summary,
          date: startTime.toJSDate().toISOString().split('T')[0],
          start_time: startTime.toJSDate().toTimeString().split(' ')[0],
          end_time: endTime.toJSDate().toTimeString().split(' ')[0],
          total_hours: Math.round(durationHours * 100) / 100,
          account_id,
        };
      });

    if (!filtered.length) {
      return { message: 'No projects found' };
    }

    const savedEvents: any[] = [];

    for (const eventDto of filtered) {
      const saved = await this.eventService.addEvent(eventDto);
      savedEvents.push(saved);
    }

    return savedEvents;
  }
}