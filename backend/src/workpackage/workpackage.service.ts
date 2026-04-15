import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account } from '../account/account.entity';
import { WorkPackage } from './workpackage.entity';
import { Project } from '../project/project.entity';
import { ProjectMember } from '../projectmember/projectmember.entity';
import { ProjectMemberWorkPackage } from '../projectmemberworkpackage/projectmemberworkpackage.entity';

type AssignedMemberSummary = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type WorkPackageWithMembers = WorkPackage & {
  assignedMembers: AssignedMemberSummary[];
};

@Injectable()
export class WorkPackageService {
  constructor(
    @InjectRepository(WorkPackage)
    private readonly workPackageRepo: Repository<WorkPackage>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,
    @InjectRepository(ProjectMemberWorkPackage)
    private readonly projectMemberWorkPackageRepo: Repository<ProjectMemberWorkPackage>,
  ) {}
  
  async assignMemberToWorkPackage(workPackageId: number, accountId: number): Promise<ProjectMemberWorkPackage> {
    const normalizedWorkPackageId = Number(workPackageId);
    const normalizedAccountId = Number(accountId);

    // Find the work package
    const workPackage = await this.workPackageRepo.findOne({ where: { id: normalizedWorkPackageId } });
    if (!workPackage) throw new NotFoundException('Work package not found');

    // Find the project member
    const projectMember = await this.projectMemberRepo.findOne({
      where: { project_id: workPackage.projectId, account_id: normalizedAccountId },
    });
    if (!projectMember) throw new NotFoundException('Project member not found for this project and account');

    const existingAssignment = await this.projectMemberWorkPackageRepo.findOne({
      where: {
        project_member_project_id: projectMember.project_id,
        project_member_account_id: projectMember.account_id,
        work_package_id: workPackage.id,
      },
    });
    if (existingAssignment) {
      throw new BadRequestException('Member is already assigned to this work package');
    }

    // Create the join entry
    const pmwp = this.projectMemberWorkPackageRepo.create({
      project_member_project_id: projectMember.project_id,
      project_member_account_id: projectMember.account_id,
      work_package_id: workPackage.id,
      projectMember,
      workPackage,
    });
    return this.projectMemberWorkPackageRepo.save(pmwp);
  }

  async create(name: string, total_hours: number, projectId: number): Promise<WorkPackage> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const workPackage = this.workPackageRepo.create({ name, total_hours, projectId, project });
    return this.workPackageRepo.save(workPackage);
  }

  async findAllByProject(projectId: number): Promise<WorkPackageWithMembers[]> {
    const normalizedProjectId = Number(projectId);

    const workPackages = await this.workPackageRepo.find({
      where: { projectId: normalizedProjectId },
      order: { id: 'ASC' },
    });

    if (workPackages.length === 0) {
      return [];
    }

    const workPackageIds = workPackages.map((workPackage) => workPackage.id);

    const assignments = await this.projectMemberWorkPackageRepo
      .createQueryBuilder('assignment')
      .innerJoin(
        ProjectMember,
        'projectMember',
        'projectMember.project_id = assignment.project_member_project_id AND projectMember.account_id = assignment.project_member_account_id',
      )
      .innerJoin(Account, 'account', 'account.id = projectMember.account_id')
      .select('assignment.work_package_id', 'workPackageId')
      .addSelect('account.id', 'accountId')
      .addSelect('account.name', 'accountName')
      .addSelect('account.email', 'accountEmail')
      .addSelect('projectMember.roles', 'projectMemberRole')
      .where('assignment.work_package_id IN (:...workPackageIds)', { workPackageIds })
      .getRawMany<{
        workPackageId: number;
        accountId: number;
        accountName: string;
        accountEmail: string;
        projectMemberRole: string;
      }>();

    const assignedMembersByWorkPackage = assignments.reduce<Record<number, AssignedMemberSummary[]>>(
      (accumulator, assignment) => {
        const assignedMember = {
          id: Number(assignment.accountId),
          name: assignment.accountName,
          email: assignment.accountEmail,
          role: assignment.projectMemberRole,
        };

        const workPackageId = Number(assignment.workPackageId);

        if (!accumulator[workPackageId]) {
          accumulator[workPackageId] = [];
        }

        accumulator[workPackageId].push(assignedMember);
        return accumulator;
      },
      {},
    );

    return workPackages.map((workPackage) => ({
      ...workPackage,
      assignedMembers: assignedMembersByWorkPackage[workPackage.id] ?? [],
    }));
  }

  async findOne(id: number): Promise<WorkPackage> {
    const wp = await this.workPackageRepo.findOne({ where: { id }, relations: ['project'] });
    if (!wp) {
      throw new NotFoundException('Work package not found');
    }
    return wp;
  }

  async update(id: number, name?: string, total_hours?: number): Promise<WorkPackage> {
    const wp = await this.findOne(id);
    if (name !== undefined) wp.name = name;
    if (total_hours !== undefined) wp.total_hours = total_hours;
    return this.workPackageRepo.save(wp);
  }

  async remove(id: number): Promise<void> {
    const wp = await this.findOne(id);
    await this.workPackageRepo.remove(wp);
  }
}
