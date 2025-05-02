import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { WorkersService } from '../workers/workers.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    private usersService: UsersService,
    private workersService: WorkersService,
  ) {}

  async getGeneralStatistics() {
    const allUsers = await this.usersService.findAll();
    const curators = allUsers.filter(user => user.role === UserRole.CURATOR && user.isActive);
    const workers = await this.workersService.findAll();

    return {
      totalCurators: curators.length,
      totalWorkers: workers.length,
    };
  }

  async getCuratorStatistics(curatorId: number) {
    const curator = await this.usersService.findById(curatorId);
    if (!curator) {
      return null;
    }

    const createdAt = new Date(curator.createdAt);
    const now = new Date();
    const daysInTeam = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const workersByDay = {};
    
    if (curator.workers && Array.isArray(curator.workers)) {
      curator.workers.forEach(worker => {
        const date = new Date(worker.createdAt);
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        
        if (!workersByDay[dateString]) {
          workersByDay[dateString] = 0;
        }
        
        workersByDay[dateString]++;
      });
    }

    const chartData = Object.keys(workersByDay).map(date => ({
      date,
      count: workersByDay[date],
    }));

    return {
      curatorName: curator.username,
      totalWorkers: curator.workers && Array.isArray(curator.workers) ? curator.workers.length : 0,
      daysInTeam,
      chartData,
    };
  }
} 