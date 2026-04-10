import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { Project } from './project.entity';
import { ProjectMember } from 'src/projectmember/projectmember.entity';
import { Account } from '../account/account.entity';
import { CreateProjectDto } from './dto-project/create-project.dto';
import { ProjectMemberRole } from 'src/projectmember/enum/projectmember.enum';
import { AddUserDto } from './dto-project/add-user.dto';

import { ProjectStatus } from './project.entity';


@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async create(dto: CreateProjectDto): Promise<{ message: string; project: Project }> {
    // 1. check if account exists
    const account = await this.accountRepo.findOne({
      where: { id: dto.account_id },
    });

    if (!account) {
      throw new NotFoundException(`Account with id ${dto.account_id} not found`);
    }

    // 2. create project
    const project = this.projectRepo.create({
      name: dto.name,
      status: dto.status || ProjectStatus.ONGOING,
      total_hours: dto.total_hours
    });

    if (dto.start_date) {
      project.start_date = new Date(dto.start_date);
    }
    if (dto.end_date) {
      project.end_date = new Date(dto.end_date);
    }

    if (project.start_date && project.end_date && project.start_date > project.end_date) {
      throw new BadRequestException('End date cannot be before start date');
    }

    const savedProject = await this.projectRepo.save(project);

    // 3. add creator as admin in project_members
    const projectMember = this.projectMemberRepo.create({
      project_id: savedProject.id,
      account_id: dto.account_id,
      roles: ProjectMemberRole.ADMIN,
    });

    await this.projectMemberRepo.save(projectMember);

    // 4. return response
    return {
      message: 'Project created successfully',
      project: savedProject,
    };
  }

  async getAllProjects() {
    return this.projectRepo.find({
      relations: ['members', 'members.account'],
    });
  }

  async getProjectsByAccountID(account_id: number): Promise<Project[]> {
    const account = await this.accountRepo.findOne({
      where: { id: account_id },
    });

    if (!account) {
      throw new NotFoundException(`Account with id ${account_id} not found`);
    }

  // Step 1: find project IDs where account is a member
  const memberRecords = await this.projectMemberRepo.find({
    where: { account_id: account_id },
  });

  const projectIds = memberRecords.map(m => m.project_id);

  if (projectIds.length === 0) return [];

  // Step 2: fetch those projects with ALL members loaded
  return this.projectRepo.find({
    where: { id: In(projectIds) },
    relations: ['members', 'members.account'],
  });
}

  async getProjectMembers(project_id: number): Promise<ProjectMember[]> {
    const project = await this.projectRepo.findOne({
      where: { id: project_id },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${project_id} not found`);
    }

    return this.projectMemberRepo.find({
      where: {
        project: {
          id: project_id,
        },
      },
      relations: ['account', 'project'],
    });
  }

  async getMyRoleInProject(project_id: number, account_id: number) {
    const role = await this.projectMemberRepo.findOne({
      where: {
        project: {id: project_id},
        account: {id: account_id}
      },
      relations: ['project', 'account'],
    });

    if(!role){
      throw new NotFoundException("User cannot be found in the current project");
    }

    return {
      role: role.roles,
      isAdmin: role.roles.toLowerCase() === 'admin',
    }
  }

  async addUserToProject(dto: AddUserDto) {
    const project = await this.projectRepo.findOne({
      where: { id: dto.project_id },
    });

    if (!project) {
      throw new NotFoundException('Project cannot be found');
    }

    const account = await this.accountRepo.findOne({
      where: { id: dto.account_id },
    });

    if (!account) {
      throw new NotFoundException('Account cannot be found');
    }

    const existingUser = await this.projectMemberRepo.findOne({
      where: {
        project: { id: dto.project_id },
        account: { id: dto.account_id },
      },
      relations: ['project', 'account'],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists in this project');
    }

    const projectMember = this.projectMemberRepo.create({
      project,
      account,
      roles: ProjectMemberRole.EMPLOYEE,
    });

    const savedProjectMember = await this.projectMemberRepo.save(projectMember);

    return {
      project_id: project.id,
      account_id: account.id,
      roles: savedProjectMember.roles,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        total_hours: project.total_hours,
        start_date: project.start_date,
        end_date: project.end_date,
      },
      account: {
        id: account.id,
        name: account.name,
        surname: account.surname,
        email: account.email,
      },
    };
  }

  async deleteProject(project_id: number, account_id: number){
    const project = await this.projectRepo.findOne({
      where: {id: project_id}
    });

    if(!project){
      throw new NotFoundException("Project cannot be found");
    }

    const account = await this.accountRepo.findOne({
      where: {id: account_id}
    })

    if (!account){
      throw new NotFoundException("Account cannot be found");
    }

    const role = await this.getMyRoleInProject(project_id, account_id);

    if(!role.isAdmin){
      throw new ForbiddenException("Only project admins may delete the project");
    }

    const deletedProject = {
      id: project.id,
      name: project.name
    }

     await this.projectMemberRepo.delete({ project_id: project_id });
  await this.projectRepo.delete({ id: project_id });

    return {
      message: "Project deleted successfully",
      project: deletedProject,
    }
  }

  async completeProject(project_id: number){
    const project = await this.projectRepo.findOne({
      where: {id: project_id}
    })

    if(!project){
      throw new NotFoundException("Project cannot be found");
    }

    project.status = ProjectStatus.COMPLETED;

    const updatedProject = await this.projectRepo.save(project)

    return{
      message: "Project completed and is now updated",
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        status: updatedProject.status,
      }
    }
  }
}