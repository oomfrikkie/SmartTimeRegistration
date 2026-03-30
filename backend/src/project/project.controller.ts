import { Controller, Post, Body, Get } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto-project/create-project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Get()
  async getAllProjects() {
    return this.projectService.getAllProjects();
  }
}