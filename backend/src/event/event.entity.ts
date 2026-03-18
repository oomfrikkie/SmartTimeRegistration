import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Account } from '../account/account.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  total_hours: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false })
  is_online: boolean;

  @Column({ type: 'boolean', default: false })
  is_series: boolean;

  @Column({ type: 'simple-json', nullable: true })
  attendees: string[] | null;

  @ManyToOne(() => Account, (account) => account.events, {
    onDelete: 'CASCADE',
  })
  account: Account;
}
