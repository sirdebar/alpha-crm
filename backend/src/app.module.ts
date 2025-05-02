import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';
import { StatisticsModule } from './statistics/statistics.module';
import { User } from './users/entities/user.entity';
import { Worker } from './workers/entities/worker.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Worker],
      synchronize: true, // Только для разработки!
    }),
    AuthModule,
    UsersModule,
    WorkersModule,
    StatisticsModule,
  ],
})
export class AppModule {}
