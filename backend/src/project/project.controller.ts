import { Controller, Patch, Post, Body, Get, Query, Param, Delete, ParseIntPipe} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto-project/create-project.dto';
import { AddUserDto } from './dto-project/add-user.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Post('members')
  addUserToProject(@Body() dto: AddUserDto) {
    return this.projectService.addUserToProject(dto);
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

  @Get(':project_id/my-role')
  getMyRoleInProject(@Param('project_id') project_id: string,
  @Query('account_id') account_id: string,) {
    return this.projectService.getMyRoleInProject(
      Number(project_id),
      Number(account_id),
    );
  }

  @Delete(':project_id')
  async deleteProject(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Query('account_id', ParseIntPipe) account_id: number,
  ) {
    return this.projectService.deleteProject(project_id, account_id);
  }

  
@Patch(':project_id/complete')
async completeProject(
  @Param('project_id', ParseIntPipe) project_id: number,
) {
  return this.projectService.completeProject(project_id);
}
}