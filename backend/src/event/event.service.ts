import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Event } from './event.entity';
import { Account } from '../account/account.entity';
import { AddEventDto } from './dto-event/add-event.dto';
import { TextFilterEventDto } from './dto-event/text-filter-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async addEvent(dto: AddEventDto) {
    const account = await this.accountRepo.findOne({
      where: { id: dto.account_id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check for existing event (same name, date, start_time, end_time, account)
    const existingEvent = await this.eventRepo.findOne({
      where: {
        name: dto.name,
        date: dto.date,
        start_time: dto.start_time,
        end_time: dto.end_time,
        account: { id: dto.account_id },
      },
      relations: ['account'],
    });

    if (existingEvent) {
      // Return the existing event in the same format
      return {
        id: existingEvent.id,
        name: existingEvent.name,
        package_name: existingEvent.package_name,
        project_name: existingEvent.project_name,
        start_time: existingEvent.start_time,
        end_time: existingEvent.end_time,
        date: existingEvent.date,
        total_hours: existingEvent.total_hours,
        location: existingEvent.location,
        description: existingEvent.description,
        is_online: existingEvent.is_online,
        is_series: existingEvent.is_series,
        attendees: existingEvent.attendees,
        account: {
          id: account.id,
          name: account.name,
          surname: account.surname,
          email: account.email,
        },
      };
    }

    const event = this.eventRepo.create({
      ...dto,
      account,
    });

    const savedEvent = await this.eventRepo.save(event);

    // Return only allowed fields, omitting password
    return {
      id: savedEvent.id,
      name: savedEvent.name,
      package_name: savedEvent.package_name,
      project_name: savedEvent.project_name,
      start_time: savedEvent.start_time,
      end_time: savedEvent.end_time,
      date: savedEvent.date,
      total_hours: savedEvent.total_hours,
      location: savedEvent.location,
      description: savedEvent.description,
      is_online: savedEvent.is_online,
      is_series: savedEvent.is_series,
      attendees: savedEvent.attendees,
      account: {
        id: account.id,
        name: account.name,
        surname: account.surname,
        email: account.email,
      },
    };
  }

  async getEventByAccountId(account_id: number) {
    const events = await this.eventRepo.find({
      where: {
        account: {
          id: account_id,
        },
      },
      relations: ['account'],
    });

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      package_name: event.package_name,
      project_name: event.project_name,
      start_time: event.start_time,
      end_time: event.end_time,
      date: event.date,
      total_hours: event.total_hours,
      location: event.location,
      description: event.description,
      is_online: event.is_online,
      is_series: event.is_series,
      attendees: event.attendees,
      account: {
        id: event.account.id,
        email: event.account.email,
      },
    }));
  }

  async getEventByEmail(email: string) {
    const events = await this.eventRepo.find({
      where: {
        account: {
          email: email,
        },
      },
      relations: ['account'],
    });

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      package_name: event.package_name,
      project_name: event.project_name,
      start_time: event.start_time,
      end_time: event.end_time,
      date: event.date,
      total_hours: event.total_hours,
      location: event.location,
      description: event.description,
      is_online: event.is_online,
      is_series: event.is_series,
      attendees: event.attendees,
      account: {
        id: event.account.id,
        email: event.account.email,
      },
    }));
  }

async getEventByAccountIdTextFiltered(dto: TextFilterEventDto): Promise<Event[]> {
  const events = await this.eventRepo.find({
    where: {
      account: {
        id: dto.account_id,
      },
      ...(dto.project_name?.trim()
        ? { project_name: ILike(`%${dto.project_name.trim()}%`) }
        : {}),
    },
  });

  if (events.length === 0) {
    throw new NotFoundException("No events can be found");
  }

 const getPackageNumber = (pkg?: string | null): number => {
  if (!pkg) return 9999;

  const match = pkg.match(/\d+/);
  return match ? parseInt(match[0], 10) : 9999;
};

  const sorted = events.sort((a, b) => {
    const pkgA = getPackageNumber(a.package_name);
    const pkgB = getPackageNumber(b.package_name);

    if (pkgA !== pkgB) {
      return pkgA - pkgB; // WP1 → WP2 → WP10
    }

    // if same package → newest date first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return sorted;
}
}
