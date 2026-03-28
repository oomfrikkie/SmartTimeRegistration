import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from './project.entity';
import { ProjectMember } from 'src/projectmember/projectmember.entity';
import { Account } from '../account/account.entity';
import { CreateProjectDto } from './dto-project/create-project.dto';
import { ProjectMemberRole } from 'src/projectmember/enum/projectmember.enum';

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
    });

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
}