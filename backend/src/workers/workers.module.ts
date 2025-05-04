import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';
import { Worker } from './entities/worker.entity';
import { UsersModule } from '../users/users.module';
import { Attendance } from './entities/attendance.entity';
import { EarningStats } from './entities/earning-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Worker, Attendance, EarningStats]),
    UsersModule,
  ],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {} 