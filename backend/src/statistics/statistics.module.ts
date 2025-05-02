import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { UsersModule } from '../users/users.module';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [UsersModule, WorkersModule],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {} 