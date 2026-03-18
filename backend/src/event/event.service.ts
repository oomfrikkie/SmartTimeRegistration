import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { Account } from '../account/account.entity';
import { AddEventDto } from './dto-event/add-event.dto';

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
        start_time: existingEvent.start_time,
        end_time: existingEvent.end_time,
        date: existingEvent.date,
        total_hours: existingEvent.total_hours,
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
      start_time: savedEvent.start_time,
      end_time: savedEvent.end_time,
      date: savedEvent.date,
      total_hours: savedEvent.total_hours,
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
      start_time: event.start_time,
      end_time: event.end_time,
      date: event.date,
      total_hours: event.total_hours,
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
      start_time: event.start_time,
      end_time: event.end_time,
      date: event.date,
      total_hours: event.total_hours,
      account: {
        id: event.account.id,
        email: event.account.email,
      },
    }));
  }
}
