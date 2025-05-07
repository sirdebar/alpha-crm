import { Controller, Get, Post, Put, Body, UseGuards, Req, Param, NotFoundException, Query, Patch } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { UpdateIncomeDto } from './dto/earnings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

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
  @UseGuards(RolesGuard)
  @Roles(UserRole.CURATOR)
  create(@Body() createWorkerDto: CreateWorkerDto, @Req() req) {
    return this.workersService.create(createWorkerDto, req.user.id);
  }

  // Эндпоинты для работы с посещаемостью

  @Get(':id/attendance')
  getAttendance(@Param('id') id: string) {
    return this.workersService.getAttendance(+id);
  }

  @Post(':id/attendance')
  markAttendance(
    @Param('id') id: string,
    @Body() createAttendanceDto: CreateAttendanceDto,
  ) {
    return this.workersService.markAttendance(+id, createAttendanceDto);
  }

  @Put(':id/attendance/:date')
  updateAttendance(
    @Param('id') id: string,
    @Param('date') date: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.workersService.updateAttendance(+id, date, updateAttendanceDto);
  }

  // Эндпоинты для работы с income и earnings

  @Get(':id/earnings')
  getEarnings(@Param('id') id: string) {
    return this.workersService.getEarningStats(+id);
  }

  @Patch(':id/income')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CURATOR, UserRole.ADMIN)
  updateIncome(
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
    @Req() req
  ) {
    // Проверяем, что работник принадлежит куратору или запрос от админа
    return this.workersService.updateIncome(+id, updateIncomeDto);
  }

  @Post(':id/earnings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CURATOR, UserRole.ADMIN)
  addEarnings(
    @Param('id') id: string,
    @Body() body: { amount: number },
    @Req() req
  ) {
    return this.workersService.addEarnings(+id, body.amount);
  }
} 