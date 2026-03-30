import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProjectMember } from 'src/projectmember/projectmember.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // One project → many project members
  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];
}