import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
