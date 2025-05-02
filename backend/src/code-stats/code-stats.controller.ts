import { Controller, Post, Get, Param, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { CodeStatsService } from './code-stats.service';
import { AddCodesDto } from './dto/add-codes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('code-stats')
@UseGuards(JwtAuthGuard)
export class CodeStatsController {
  constructor(private codeStatsService: CodeStatsService) {}

  // Добавление кодов работнику (только админ)
  @Post('workers/:id/add-codes')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async addCodes(
    @Param('id') workerId: string,
    @Body() addCodesDto: AddCodesDto,
    @Req() req,
  ) {
    const adminId = req.user.id;
    return this.codeStatsService.addCodes(+workerId, adminId, addCodesDto);
  }

  // Получение почасовой статистики за день (доступно всем авторизованным пользователям)
  @Get('daily-hourly')
  async getDailyHourlyStats() {
    return this.codeStatsService.getDailyHourlyStats();
  }

  // Получение топа работников за день
  @Get('top-workers')
  async getTopWorkersToday() {
    return this.codeStatsService.getTopWorkersToday();
  }

  // Получение статистики по конкретному работнику
  @Get('workers/:id')
  async getWorkerStats(@Param('id') workerId: string) {
    return this.codeStatsService.getWorkerStats(+workerId);
  }
} 