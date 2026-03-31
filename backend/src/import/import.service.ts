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

    const filterStart = new Date(`${String(start_date)}T00:00:00`);
    const filterEnd = new Date(`${String(end_date)}T23:59:59.999`);

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

        const location =
          (event.getFirstPropertyValue('location') as string | null) ||
          undefined;

        const description =
          (event.getFirstPropertyValue('description') as string | null) ||
          undefined;

        const is_series = !!event.getFirstProperty('rrule');

        const is_online =
          !!(location && location.toLowerCase().includes('teams')) ||
          !!(
            description &&
            description.toLowerCase().includes('microsoft teams')
          ) ||
          !!event.getFirstProperty('x-microsoft-skypeteamsmeetingurl');

        const attendeeProps = event.getAllProperties('attendee');
        const attendees = attendeeProps
          .filter((a) => {
            const role = a.getParameter('role');
            return !role || role === 'REQ-PARTICIPANT';
          })
          .map((a) => {
            const displayName = a.getParameter('displayName') as string | null;
            const value = a.getFirstValue() as string | null;
            return displayName || (value ? value.replace('mailto:', '') : '');
          })
          .filter(Boolean);

        const project_name =
          vevent.summary?.split(' - ')[0]?.trim() || undefined;

        let package_name: string | undefined;

        if (description) {
          const cleanedDescription = description.trim();

          const packageMatch = cleanedDescription.match(
            /^(wp\s*[a-z0-9]+|work\s*package\s+[a-z0-9]+|package\s+[a-z0-9]+)$/i,
          );

          const labeledPackageMatch = cleanedDescription.match(
            /^(?:wp|work\s*package|package)\s*:\s*([a-z0-9 ]+)$/i,
          );

          package_name =
            packageMatch?.[1]?.trim() ||
            labeledPackageMatch?.[1]?.trim() ||
            undefined;
        }

        return {
          name: vevent.summary,
          package_name,
          project_name,
          date: startTime.toJSDate().toISOString().split('T')[0],
          start_time: startTime.toJSDate().toTimeString().split(' ')[0],
          end_time: endTime.toJSDate().toTimeString().split(' ')[0],
          total_hours: Math.round(durationHours * 100) / 100,
          location,
          description,
          is_online,
          is_series,
          attendees,
          account_id,
        };
      });

    if (!filtered.length) {
      return { message: 'No projects found' };
    }

    const savedEvents: Awaited<
      ReturnType<typeof this.eventService.addEvent>
    >[] = [];

    for (const eventDto of filtered) {
      const saved = await this.eventService.addEvent(eventDto);
      savedEvents.push(saved);
    }

    return savedEvents;
  }
}