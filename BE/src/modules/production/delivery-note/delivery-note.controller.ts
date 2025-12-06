// production/delivery-note/delivery-note.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DeliveryNoteService } from './delivery-note.service';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';

@Controller('delivery-note')
export class DeliveryNoteController {
  constructor(private readonly service: DeliveryNoteService) { }

  @Post()
  async create(@Body() dto: CreateDeliveryNoteDto) {
    const res = await this.service.create(dto);
    return { success: true, message: 'Created', data: res };
  }

  @Get()
  async list() {
    const res = await this.service.findAll();
    return { success: true, message: 'Fetch successful', data: res };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const res = await this.service.findById(id);
    return { success: true, message: 'Fetch successful', data: res };
  }

  // NEW: get remaining amounts for a list of PO item ids
  @Post('poitems/remaining')
  async getRemainingForPoItems(@Body() body: { ids: string[] }) {
    const ids = body?.ids ?? [];
    const res = await this.service.getRemainingForPoItems(ids);
    return { success: true, message: 'Fetch successful', data: res };
  }
}
