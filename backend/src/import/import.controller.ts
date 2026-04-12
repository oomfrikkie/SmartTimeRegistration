import { Body, Controller, Post } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportCalendarDto } from './dto-import/import-calendar.dto';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post()
  async importCalendar(@Body() dto: ImportCalendarDto) {
    return this.importService.importAndSaveEvents(
      dto.icsUrl,
      new Date(dto.start_date),
      new Date(dto.end_date),
      dto.account_id,
    );
  }
}
