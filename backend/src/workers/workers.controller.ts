import { Controller, Get, Post, Body, UseGuards, Req, Param, NotFoundException } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('workers')
@UseGuards(JwtAuthGuard)
export class WorkersController {
  constructor(private workersService: WorkersService) {}

  @Get()
  findAll() {
    return this.workersService.findAll();
  }

  @Get('stats')
  getWorkerStats() {
    return this.workersService.getWorkerStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const worker = await this.workersService.findOne(+id);
    if (!worker) {
      throw new NotFoundException(`Работник с ID ${id} не найден`);
    }
    return worker;
  }

  @Post()
  create(@Body() createWorkerDto: CreateWorkerDto, @Req() req) {
    return this.workersService.create(createWorkerDto, req.user.id);
  }
} 