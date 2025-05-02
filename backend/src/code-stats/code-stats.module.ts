import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeStatsController } from './code-stats.controller';
import { CodeStatsService } from './code-stats.service';
import { CodeTransaction } from './entities/code-transaction.entity';
import { Worker } from '../workers/entities/worker.entity';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CodeTransaction, Worker]),
    WorkersModule,
  ],
  controllers: [CodeStatsController],
  providers: [CodeStatsService],
  exports: [CodeStatsService],
})
export class CodeStatsModule {} 