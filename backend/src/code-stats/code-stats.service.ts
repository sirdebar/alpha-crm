import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CodeTransaction } from './entities/code-transaction.entity';
import { Worker } from '../workers/entities/worker.entity';
import { AddCodesDto } from './dto/add-codes.dto';
import { WorkersService } from '../workers/workers.service';

@Injectable()
export class CodeStatsService {
  constructor(
    @InjectRepository(CodeTransaction)
    private codeTransactionRepository: Repository<CodeTransaction>,
    @InjectRepository(Worker)
    private workerRepository: Repository<Worker>,
    private workersService: WorkersService,
  ) {
    // Запуск задачи сброса счетчиков каждые 24 часа в полночь
    this.scheduleResetCounters();
  }

  private scheduleResetCounters() {
    const now = new Date();
    // Устанавливаем время для запуска - следующая полночь
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    // Рассчитываем время до полуночи в миллисекундах
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyCounters();
      // После выполнения снова запланировать на следующий день
      setInterval(this.resetDailyCounters.bind(this), 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  private async resetDailyCounters() {
    try {
      // Сбрасываем счетчики для всех работников
      await this.workerRepository.update({}, { todayCodesCount: 0 });
      console.log('Сброс дневных счетчиков кодов успешно выполнен');
    } catch (error) {
      console.error('Ошибка при сбросе дневных счетчиков кодов:', error);
    }
  }

  async addCodes(workerId: number, adminId: number, addCodesDto: AddCodesDto) {
    // Проверяем, что ID имеют числовые значения
    if (isNaN(workerId) || isNaN(adminId)) {
      throw new Error('ID работника или администратора некорректный');
    }
    
    const worker = await this.workersService.findOne(workerId);
    if (!worker) {
      throw new NotFoundException('Работник не найден');
    }

    const now = new Date();
    const hour = now.getHours();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Создаем новую транзакцию
    const transaction = this.codeTransactionRepository.create({
      count: addCodesDto.count,
      workerId,
      addedById: adminId,
      hour,
      date,
    });

    await this.codeTransactionRepository.save(transaction);

    // Обновляем общий счетчик для работника
    worker.todayCodesCount += addCodesDto.count;
    await this.workerRepository.save(worker);

    return transaction;
  }

  async getDailyHourlyStats() {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Получаем статистику по часам для текущего дня
    const hourlyStats = await this.codeTransactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.hour', 'hour')
      .addSelect('SUM(transaction.count)', 'total')
      .where('transaction.date = :date', { date })
      .groupBy('transaction.hour')
      .orderBy('transaction.hour', 'ASC')
      .getRawMany();

    // Заполняем нулями отсутствующие часы
    const result = Array(24).fill(0).map((_, index) => {
      const hourData = hourlyStats.find(stat => stat.hour === index);
      return {
        hour: index,
        total: hourData ? parseInt(hourData.total) : 0
      };
    });

    return result;
  }

  async getTopWorkersToday() {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Получаем топ работников для текущего дня
    const workers = await this.workerRepository
      .createQueryBuilder('worker')
      .leftJoinAndSelect('worker.curator', 'curator')
      .where('worker.todayCodesCount > 0')
      .orderBy('worker.todayCodesCount', 'DESC')
      .take(10)
      .getMany();

    return workers.map(worker => ({
      id: worker.id,
      username: worker.username,
      tag: worker.tag,
      codesCount: worker.todayCodesCount,
      curatorName: worker.curator ? worker.curator.username : 'Нет куратора'
    }));
  }

  async getWorkerStats(workerId: number) {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD

    const worker = await this.workerRepository.findOne({
      where: { id: workerId },
      relations: ['curator']
    });

    if (!worker) {
      throw new NotFoundException('Работник не найден');
    }

    // Получаем статистику по часам для работника за текущий день
    const hourlyStats = await this.codeTransactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.hour', 'hour')
      .addSelect('SUM(transaction.count)', 'total')
      .where('transaction.workerId = :workerId', { workerId })
      .andWhere('transaction.date = :date', { date })
      .groupBy('transaction.hour')
      .orderBy('transaction.hour', 'ASC')
      .getRawMany();

    // Заполняем нулями отсутствующие часы
    const hourlyData = Array(24).fill(0).map((_, index) => {
      const hourData = hourlyStats.find(stat => stat.hour === index);
      return {
        hour: index,
        total: hourData ? parseInt(hourData.total) : 0
      };
    });

    return {
      worker: {
        id: worker.id,
        username: worker.username,
        tag: worker.tag,
        codesCount: worker.todayCodesCount,
        curatorName: worker.curator ? worker.curator.username : 'Нет куратора'
      },
      hourlyData
    };
  }
} 