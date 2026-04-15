import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeUpdate, BeforeInsert } from 'typeorm';
import { ProjectMember } from 'src/projectmember/projectmember.entity';
import { WorkPackage } from '../workpackage/workpackage.entity';

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

  @Column({ 
    type: 'decimal', 
    precision: 6, 
    scale: 2,
    nullable: false,
    default: 0
  })
  total_hours: number;

  @Column({ 
    type: 'date', 
    nullable: true 
  })
  start_date: Date;

  @Column({ 
    type: 'date', 
    nullable: true 
  })
  end_date: Date;

  // Add budget column
  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    nullable: false,
    default: 0
  })
  budget: number;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    nullable: false,
    default: 0
  })
  subsidy: number;

  // One project → many project members
  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];

  // One project → many work packages
  @OneToMany(() => WorkPackage, (workPackage) => workPackage.project)
  workPackages: WorkPackage[];
  
  // Automatically updating the project status once the end date has passed
  @BeforeUpdate()
  @BeforeInsert()
  updateEndDateOnFinalize() {
    if (this.status === ProjectStatus.COMPLETED && !this.end_date) {
      this.end_date = new Date();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateHours() {
    if (this.total_hours < 0) {
      throw new Error('Total hours cannot be negative');
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

  @BeforeInsert()
  @BeforeUpdate()
  validateFinancials() {
    if (this.budget < 0) {
      throw new Error('Budget cannot be negative');
    }
    
    if (this.subsidy < 0) {
      throw new Error('Subsidy cannot be negative');
    }
  }
}