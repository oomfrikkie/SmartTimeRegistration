import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Event } from '../event/event.entity';

@Entity({ name: 'account' })
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'surname', type: 'varchar', length: 100 })
  surname: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'bigint', nullable: true })
  resetPasswordExpires: number;

  @OneToMany(() => Event, (event) => event.account)
  events: Event[];
}
