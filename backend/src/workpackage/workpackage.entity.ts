import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../project/project.entity';

@Entity('work_package')
export class WorkPackage {
  @ApiProperty({ example: 1, description: 'Unique identifier for the work package' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Frontend Development', description: 'Name of the work package' })
  @Column({ type: 'varchar', length: 255 })
  name: string;


  @ApiProperty({ example: 40, description: 'Total hours for the work package' })
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  total_hours: number;

  @ApiProperty({ example: 1, description: 'ID of the project this work package belongs to' })
  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Project, (project: Project) => project.workPackages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
