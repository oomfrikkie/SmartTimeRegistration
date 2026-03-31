import { Controller, Post, Body, Get, Query} from '@nestjs/common';
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

@Get('by-account')
getProjectsByAccount(@Query('account_id') account_id: string) {
  return this.projectService.getProjectsByAccountID(Number(account_id));
}

@Get('members')
getProjectMembers(@Query('project_id') project_id: string) {
  return this.projectService.getProjectMembers(Number(project_id));
}


}