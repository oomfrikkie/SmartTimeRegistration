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

  async addEvent(dto: AddEventDto): Promise<Event> {
    const account = await this.accountRepo.findOne({
      where: { id: dto.account_id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const event = this.eventRepo.create({
      ...dto,
      account,
    });

    return await this.eventRepo.save(event);
  }
}