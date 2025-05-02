import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('general')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getGeneralStatistics() {
    return this.statisticsService.getGeneralStatistics();
  }

  @Get('curator')
  async getCuratorStatistics(@Req() req) {
    try {
      const stats = await this.statisticsService.getCuratorStatistics(req.user.id);
      if (!stats) {
        return {
          curatorName: req.user.username || 'Куратор',
          totalWorkers: 0,
          daysInTeam: 0,
          chartData: []
        };
      }
      return stats;
    } catch (error) {
      console.error('Ошибка при получении статистики куратора:', error);
      return {
        curatorName: req.user.username || 'Куратор',
        totalWorkers: 0,
        daysInTeam: 0,
        chartData: []
      };
    }
  }
} 