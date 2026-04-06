import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeUpdate, BeforeInsert } from 'typeorm';
import { ProjectMember } from 'src/projectmember/projectmember.entity';

export enum ProjectStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed'
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column(
    {type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ONGOING
  })
  status : ProjectStatus;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  // One project → many project members
  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];
  
  // Automatically updating the project status once the end date has passed
  @BeforeUpdate()
  @BeforeInsert()
  updateEndDateOnFinalize() {
    if (this.status === ProjectStatus.COMPLETED && !this.end_date) {
      this.end_date = new Date();
    }
  }

  // Ensuring valid dates
  @BeforeInsert()
  @BeforeUpdate()
  validateDates() {
    if (this.start_date && this.end_date && this.start_date > this.end_date) {
      throw new Error('Start date cannot be after end date');
    }
    
    if (this.status === ProjectStatus.COMPLETED && !this.end_date) {
      throw new Error('Finalized projects must have an end date');
    }
  }
}