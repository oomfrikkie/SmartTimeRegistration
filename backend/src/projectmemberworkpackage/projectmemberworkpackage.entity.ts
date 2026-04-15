import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectMember } from '../projectmember/projectmember.entity';
import { WorkPackage } from '../workpackage/workpackage.entity';

@Entity({ name: 'project_member_work_package' })
export class ProjectMemberWorkPackage {
  @PrimaryColumn({ name: 'project_member_project_id', type: 'int' })
  project_member_project_id: number;

  @PrimaryColumn({ name: 'project_member_account_id', type: 'int' })
  project_member_account_id: number;

  @PrimaryColumn({ name: 'work_package_id', type: 'int' })
  work_package_id: number;

  @ManyToOne(() => ProjectMember, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'project_member_project_id', referencedColumnName: 'project_id' },
    { name: 'project_member_account_id', referencedColumnName: 'account_id' },
  ])
  projectMember: ProjectMember;

  @ManyToOne(() => WorkPackage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_package_id', referencedColumnName: 'id' })
  workPackage: WorkPackage;
}
