import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkPackage } from './workpackage.entity';
import { Project } from '../project/project.entity';
import { ProjectMember } from '../projectmember/projectmember.entity';
import { ProjectMemberWorkPackage } from '../projectmemberworkpackage/projectmemberworkpackage.entity';

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
    // Find the work package
    const workPackage = await this.workPackageRepo.findOne({ where: { id: workPackageId } });
    if (!workPackage) throw new NotFoundException('Work package not found');

    // Find the project member
    const projectMember = await this.projectMemberRepo.findOne({
      where: { project_id: workPackage.projectId, account_id: accountId },
    });
    if (!projectMember) throw new NotFoundException('Project member not found for this project and account');

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

  async findAllByProject(projectId: number): Promise<WorkPackage[]> {
    return this.workPackageRepo.find({ where: { project: { id: projectId } } });
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
