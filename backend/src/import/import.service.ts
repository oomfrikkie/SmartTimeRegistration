import { Injectable } from '@nestjs/common';
import ICAL from 'ical.js';

@Injectable()
export class ImportService {
  async convertIcsToJson(icsUrl: string) {
    const response = await fetch(icsUrl);
    const icsText = await response.text();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = ICAL.parse(icsText);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const component = new ICAL.Component(parsed);
    const events = component.getAllSubcomponents('vevent');

    return events.map((event) => {
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
      };
    });
  }
}
