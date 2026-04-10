import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Project } from '../project/project.entity';
import { Account } from '../account/account.entity';
import { ProjectMemberRole } from './enum/projectmember.enum';

@Entity({ name: 'project_member' })
export class ProjectMember {
  @PrimaryColumn({ name: 'project_id', type: 'int' })
  project_id: number;

  @PrimaryColumn({ name: 'account_id', type: 'int' })
  account_id: number;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Account, (account) => account.projectMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({
    name: 'roles',
    type: 'enum',
    enum: ProjectMemberRole,
  })
  roles: ProjectMemberRole;
}