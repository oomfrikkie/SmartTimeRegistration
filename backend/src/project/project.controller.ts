import { Controller, Patch, Post, Body, Get, Query, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto-project/create-project.dto';
import { AddUserDto } from './dto-project/add-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('by-account')
  getProjectsByAccount(@Req() req) {
    return this.projectService.getProjectsByAccountID(req.user.id);
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

  @Get(':project_id/member-events')
  async getProjectMemberEvents(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Query('account_id', ParseIntPipe) account_id: number,
  ) {
    return this.projectService.getProjectMemberEvents(project_id, account_id);
  }

  @Get(':project_id/member-hours')
  async getProjectMemberHours(
    @Param('project_id', ParseIntPipe) project_id: number,
    @Query('account_id', ParseIntPipe) account_id: number,
  ) {
    return this.projectService.getProjectMemberHours(account_id, project_id);
  }

  // Endpoint 1: Get project budget
  @Get(':project_id/budget')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getProjectBudget(@Param('project_id', ParseIntPipe) project_id: number) {
    const budget = await this.projectService.getProjectBudget(project_id);
    return {
      project_id,
      budget
    };
  }

  @Get(':project_id/subsidy')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getProjectSubsidy(@Param('project_id', ParseIntPipe) project_id: number) {
    const subsidy = await this.projectService.getProjectSubsidy(project_id);
    return {
      project_id,
      subsidy
    };
  }
}