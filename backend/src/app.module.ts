import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ProfileModule } from './profile/profile.module';
import { SearchModule } from './search/search.module';
import { CodeStatsModule } from './code-stats/code-stats.module';
import { FinanceModule } from './finance/finance.module';
import { User } from './users/entities/user.entity';
import { Worker } from './workers/entities/worker.entity';
import { CodeTransaction } from './code-stats/entities/code-transaction.entity';
import { Attendance } from './workers/entities/attendance.entity';
import { EarningStats } from './workers/entities/earning-stats.entity';
import { FinanceBank } from './finance/entities/finance-bank.entity';
import { FinanceTransaction } from './finance/entities/finance-transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Worker, CodeTransaction, Attendance, EarningStats, FinanceBank, FinanceTransaction],
      synchronize: true, // Только для разработки!
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        maxAge: 86400000, // One day
      },
    }),
    AuthModule,
    UsersModule,
    WorkersModule,
    StatisticsModule,
    ProfileModule,
    SearchModule,
    CodeStatsModule,
    FinanceModule,
  ],
})
export class AppModule {}
