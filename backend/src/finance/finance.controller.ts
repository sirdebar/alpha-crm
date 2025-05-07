import { Controller, Get, Post, Patch, Body, UseGuards, Param, Query, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdateCuratorFinanceDto } from './dto/curator-finance.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // Получить текущие финансы для куратора (для текущего пользователя-куратора)
  @Get('my')
  @Roles(UserRole.CURATOR)
  @UseGuards(RolesGuard)
  getMyFinance(@Req() req) {
    return this.financeService.getCuratorFinanceOrCreate(req.user.id);
  }

  // Обновить данные о финансах для текущего пользователя-куратора
  @Patch('my')
  @Roles(UserRole.CURATOR)
  @UseGuards(RolesGuard)
  updateMyFinance(@Req() req, @Body() updateDto: UpdateCuratorFinanceDto) {
    return this.financeService.updateCuratorFinance(req.user.id, updateDto);
  }

  // Получить историю финансов для текущего пользователя-куратора
  @Get('my/history')
  @Roles(UserRole.CURATOR)
  @UseGuards(RolesGuard)
  getMyFinanceHistory(@Req() req, @Query('months') months: number = 6) {
    return this.financeService.getCuratorFinanceHistory(req.user.id, months);
  }

  // Следующие эндпоинты доступны только администраторам

  // Получить топ кураторов по профиту
  @Get('top')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getTopCurators(@Query('month') month?: string, @Query('limit') limit: number = 3) {
    return this.financeService.getTopCurators(month, limit);
  }

  // Получить финансовую статистику по всем кураторам
  @Get('all')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getAllCuratorsStats(@Query('month') month?: string) {
    return this.financeService.getAllCuratorsStats(month);
  }

  // Получить финансовые данные конкретного куратора (для админа)
  @Get('curator/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getCuratorFinance(@Param('id') id: string) {
    return this.financeService.getCuratorFinanceOrCreate(+id);
  }

  // Обновить финансовые данные конкретного куратора (для админа)
  @Patch('curator/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  updateCuratorFinance(
    @Param('id') id: string,
    @Body() updateDto: UpdateCuratorFinanceDto
  ) {
    return this.financeService.updateCuratorFinance(+id, updateDto);
  }

  // Получить историю финансов конкретного куратора (для админа)
  @Get('curator/:id/history')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getCuratorFinanceHistory(
    @Param('id') id: string,
    @Query('months') months: number = 6
  ) {
    return this.financeService.getCuratorFinanceHistory(+id, months);
  }
} 