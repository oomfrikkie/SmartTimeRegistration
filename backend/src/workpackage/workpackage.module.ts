import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkPackage } from './workpackage.entity';
import { WorkPackageService } from './workpackage.service';
import { WorkPackageController } from './workpackage.controller';
import { Project } from '../project/project.entity';
import { ProjectMember } from '../projectmember/projectmember.entity';
import { ProjectMemberWorkPackage } from '../projectmemberworkpackage/projectmemberworkpackage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkPackage, Project, ProjectMember, ProjectMemberWorkPackage])],
  providers: [WorkPackageService],
  controllers: [WorkPackageController],
  exports: [WorkPackageService],
})
export class WorkPackageModule {}
