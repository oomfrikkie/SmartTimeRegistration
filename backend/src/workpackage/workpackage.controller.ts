import { Controller, Post, Body, Param, Get, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { WorkPackageService } from './workpackage.service';
import { WorkPackage } from './workpackage.entity';

@ApiTags('work-packages')
@Controller('work-packages')
export class WorkPackageController {
  constructor(private readonly workPackageService: WorkPackageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new work package' })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, total_hours: { type: 'number' }, projectId: { type: 'number' } } } })
  @ApiResponse({ status: 201, type: WorkPackage })
  async create(@Body() body: { name: string; total_hours: number; projectId: number }) {
    return this.workPackageService.create(body.name, body.total_hours, body.projectId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all work packages for a project' })
  @ApiParam({ name: 'projectId', type: Number })
  @ApiResponse({ status: 200, description: 'Work packages including assigned members' })
  async findAllByProject(@Param('projectId') projectId: string) {
    return this.workPackageService.findAllByProject(Number(projectId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work package by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: WorkPackage })
  async findOne(@Param('id') id: number) {
    return this.workPackageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a work package' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, total_hours: { type: 'number' } } } })
  @ApiResponse({ status: 200, type: WorkPackage })
  async update(@Param('id') id: number, @Body() body: { name?: string; total_hours?: number }) {
    return this.workPackageService.update(id, body.name, body.total_hours);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a work package' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: number) {
    await this.workPackageService.remove(id);
    return { message: 'Deleted' };
  }

  @Post(':id/assign-member')
  @ApiOperation({ summary: 'Assign a member to a work package' })
  @ApiParam({ name: 'id', type: Number, description: 'Work package ID' })
  @ApiBody({ schema: { properties: { accountId: { type: 'number' } } } })
  @ApiResponse({ status: 201, description: 'Member assigned to work package' })
  async assignMember(
    @Param('id') workPackageId: string,
    @Body() body: { accountId: number }
  ) {
    return this.workPackageService.assignMemberToWorkPackage(Number(workPackageId), Number(body.accountId));
  }
  }

