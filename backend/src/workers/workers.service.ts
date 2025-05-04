import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Worker } from './entities/worker.entity';
import { Attendance } from './entities/attendance.entity';
import { EarningStats } from './entities/earning-stats.entity';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { CreateAttendanceDto, UpdateAttendanceDto, WorkerAttendanceResponseDto, AttendanceRecordResponseDto } from './dto/attendance.dto';
import { UpdateIncomeDto, EarningStatsResponseDto } from './dto/earnings.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker)
    private workersRepository: Repository<Worker>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(EarningStats)
    private earningStatsRepository: Repository<EarningStats>,
    private usersService: UsersService,
  ) {
    // Инициализация статистики при запуске
    this.initializeEarningsStats();
    
    // Запуск задачи сброса статистики заработка каждые 24 часа в полночь
    this.scheduleResetEarnings();
  }

  // Приватный метод для инициализации статистики заработка
  private async initializeEarningsStats() {
    try {
      // Получаем текущую дату
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Проверяем, есть ли уже статистика за сегодня
      const existingStats = await this.earningStatsRepository.findOne({
        where: { date: todayStr }
      });
      
      // Если уже есть записи на сегодня, пропускаем инициализацию
      if (existingStats) {
        console.log('Статистика заработка уже инициализирована');
        return;
      }
      
      // Получаем всех работников
      const workers = await this.workersRepository.find();
      console.log(`Инициализация статистики заработка для ${workers.length} работников`);
      
      // Для каждого работника создаем начальную запись
      for (const worker of workers) {
        const todayStats = this.earningStatsRepository.create({
          workerId: worker.id,
          date: todayStr,
          dailyEarnings: 0,
          weeklyEarnings: 0,
          monthlyEarnings: 0
        });
        
        await this.earningStatsRepository.save(todayStats);
      }
      
      console.log('Статистика заработка успешно инициализирована');
    } catch (error) {
      console.error('Ошибка при инициализации статистики заработка:', error);
    }
  }

  private scheduleResetEarnings() {
    const now = new Date();
    // Устанавливаем время для запуска - следующая полночь
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    // Рассчитываем время до полуночи в миллисекундах
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    console.log(`Сброс дневной статистики заработка запланирован через ${timeUntilMidnight / 1000 / 60} минут`);
    
    setTimeout(() => {
      this.resetDailyEarnings();
      // После выполнения снова запланировать на следующий день
      setInterval(this.resetDailyEarnings.bind(this), 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  async findAll() {
    return this.workersRepository.find({
      relations: ['curator'],
    });
  }

  async findOne(id: number): Promise<Worker | null> {
    return this.workersRepository.findOne({
      where: { id },
      relations: ['curator']
    });
  }

  async findByUsername(username: string) {
    return this.workersRepository.findOne({
      where: { username },
      relations: ['curator'],
    });
  }

  async create(createWorkerDto: CreateWorkerDto, curatorId: number) {
    const existingWorker = await this.findByUsername(createWorkerDto.username);
    if (existingWorker) {
      throw new ConflictException('Работник с таким именем уже существует');
    }

    const curator = await this.usersService.findById(curatorId);
    if (!curator) {
      throw new NotFoundException('Куратор не найден');
    }

    const hashedPassword = await bcrypt.hash(createWorkerDto.password, 10);
    const newWorker = this.workersRepository.create({
      ...createWorkerDto,
      password: hashedPassword,
      curator,
      curatorId,
    });

    await this.workersRepository.save(newWorker);
    const { password, ...result } = newWorker;
    return result;
  }

  async getWorkerStats() {
    const workers = await this.workersRepository.find({
      relations: ['curator'],
    });

    const stats = workers.map(worker => {
      const createdAt = new Date(worker.createdAt);
      const now = new Date();
      const daysInTeam = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: worker.id,
        username: worker.username,
        tag: worker.tag,
        curatorName: worker.curator ? worker.curator.username : '',
        daysInTeam,
        createdAt: worker.createdAt,
        todayCodesCount: worker.todayCodesCount || 0,
      };
    });

    return stats;
  }

  // Методы для работы с посещаемостью
  
  async getAttendance(workerId: number): Promise<WorkerAttendanceResponseDto> {
    const worker = await this.findOne(workerId);
    if (!worker) {
      throw new NotFoundException(`Работник с ID ${workerId} не найден`);
    }

    // Получаем все записи о посещаемости для данного работника
    const attendanceRecords = await this.attendanceRepository.find({
      where: { workerId },
      order: { date: 'DESC' },
    });

    // Преобразуем записи в нужный формат
    const records: AttendanceRecordResponseDto[] = attendanceRecords.map(record => ({
      date: record.date,
      present: record.present,
      reason: record.reason,
    }));

    // Подсчитываем общее количество дней присутствия
    const totalDays = records.filter(record => record.present).length;

    // Рассчитываем лучший стрик присутствия
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let currentStreak = 0;
    let bestStreak = 0;
    
    for (const record of sortedRecords) {
      if (record.present) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Рассчитываем процент посещаемости за последнюю неделю
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const recentRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= oneWeekAgo && recordDate <= today;
    });

    const weeklyPercentage = recentRecords.length === 0 
      ? 0 
      : (recentRecords.filter(record => record.present).length / recentRecords.length) * 100;

    return {
      totalDays,
      bestStreak,
      records,
      weeklyPercentage,
    };
  }

  async markAttendance(workerId: number, dto: CreateAttendanceDto): Promise<AttendanceRecordResponseDto> {
    const worker = await this.findOne(workerId);
    if (!worker) {
      throw new NotFoundException(`Работник с ID ${workerId} не найден`);
    }

    // Проверяем, существует ли уже запись на эту дату
    const existingRecord = await this.attendanceRepository.findOne({
      where: { workerId, date: dto.date },
    });

    if (existingRecord) {
      // Если запись уже существует, обновляем её
      existingRecord.present = dto.present;
      existingRecord.reason = dto.reason;
      await this.attendanceRepository.save(existingRecord);
      
      return {
        date: existingRecord.date,
        present: existingRecord.present,
        reason: existingRecord.reason,
      };
    }

    // Создаем новую запись
    const newRecord = this.attendanceRepository.create({
      workerId,
      date: dto.date,
      present: dto.present,
      reason: dto.reason,
    });

    await this.attendanceRepository.save(newRecord);

    return {
      date: newRecord.date,
      present: newRecord.present,
      reason: newRecord.reason,
    };
  }

  async updateAttendance(workerId: number, date: string, dto: UpdateAttendanceDto): Promise<AttendanceRecordResponseDto> {
    const worker = await this.findOne(workerId);
    if (!worker) {
      throw new NotFoundException(`Работник с ID ${workerId} не найден`);
    }

    // Проверяем, существует ли запись на эту дату
    const existingRecord = await this.attendanceRepository.findOne({
      where: { workerId, date },
    });

    if (!existingRecord) {
      // Если записи нет, создаем новую
      return this.markAttendance(workerId, { date, ...dto });
    }

    // Обновляем существующую запись
    existingRecord.present = dto.present;
    existingRecord.reason = dto.reason;
    await this.attendanceRepository.save(existingRecord);
    
    return {
      date: existingRecord.date,
      present: existingRecord.present,
      reason: existingRecord.reason,
    };
  }

  // Методы для работы с income и earnings
  
  async updateIncome(workerId: number, updateIncomeDto: UpdateIncomeDto) {
    const worker = await this.findOne(workerId);
    if (!worker) {
      throw new NotFoundException(`Работник с ID ${workerId} не найден`);
    }

    worker.income = updateIncomeDto.income;
    return this.workersRepository.save(worker);
  }

  async getEarningStats(workerId: number): Promise<EarningStatsResponseDto> {
    const worker = await this.findOne(workerId);
    if (!worker) {
      throw new NotFoundException(`Работник с ID ${workerId} не найден`);
    }

    // Получаем текущую дату
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Проверяем, есть ли запись о заработке на сегодня
    let todayStats = await this.earningStatsRepository.findOne({
      where: { workerId, date: todayStr }
    });

    // Если нет, создаем новую запись с нулевым заработком
    if (!todayStats) {
      // Получаем дату начала недели (понедельник)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      
      // Получаем дату начала месяца
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

      // Рассчитываем накопленный заработок за неделю и месяц
      const weeklyStats = await this.earningStatsRepository.find({
        where: {
          workerId,
          date: MoreThanOrEqual(startOfWeekStr)
        }
      });
      const weeklyEarnings = weeklyStats.reduce((sum, stat) => sum + stat.dailyEarnings, 0);

      const monthlyStats = await this.earningStatsRepository.find({
        where: {
          workerId,
          date: MoreThanOrEqual(startOfMonthStr)
        }
      });
      const monthlyEarnings = monthlyStats.reduce((sum, stat) => sum + stat.dailyEarnings, 0);
      
      todayStats = this.earningStatsRepository.create({
        workerId,
        date: todayStr,
        dailyEarnings: 0,
        weeklyEarnings,
        monthlyEarnings
      });
      await this.earningStatsRepository.save(todayStats);
    }

    return {
      dailyEarnings: todayStats.dailyEarnings,
      weeklyEarnings: todayStats.weeklyEarnings,
      monthlyEarnings: todayStats.monthlyEarnings,
      income: worker.income
    };
  }

  async addEarnings(workerId: number, amount: number): Promise<EarningStatsResponseDto> {
    const worker = await this.findOne(workerId);
    if (!worker) {
      throw new NotFoundException(`Работник с ID ${workerId} не найден`);
    }

    // Получаем текущую дату
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Получаем дату начала недели (понедельник)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    
    // Получаем дату начала месяца
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    // Проверяем, есть ли запись о заработке на сегодня
    let todayStats = await this.earningStatsRepository.findOne({
      where: { workerId, date: todayStr }
    });

    // Если нет записи на сегодня, создаем новую
    if (!todayStats) {
      // Рассчитываем накопленный заработок за неделю и месяц
      const weeklyStats = await this.earningStatsRepository.find({
        where: {
          workerId,
          date: MoreThanOrEqual(startOfWeekStr)
        }
      });
      const weeklyEarnings = weeklyStats.reduce((sum, stat) => sum + stat.dailyEarnings, 0);

      const monthlyStats = await this.earningStatsRepository.find({
        where: {
          workerId,
          date: MoreThanOrEqual(startOfMonthStr)
        }
      });
      const monthlyEarnings = monthlyStats.reduce((sum, stat) => sum + stat.dailyEarnings, 0);
      
      todayStats = this.earningStatsRepository.create({
        workerId,
        date: todayStr,
        dailyEarnings: 0,
        weeklyEarnings,
        monthlyEarnings
      });
    }

    // Увеличиваем дневной заработок
    todayStats.dailyEarnings += amount;
    
    // Обновляем недельный и месячный заработок
    todayStats.weeklyEarnings += amount;
    todayStats.monthlyEarnings += amount;
    
    await this.earningStatsRepository.save(todayStats);

    return {
      dailyEarnings: todayStats.dailyEarnings,
      weeklyEarnings: todayStats.weeklyEarnings,
      monthlyEarnings: todayStats.monthlyEarnings,
      income: worker.income
    };
  }

  // Метод для сброса дневной статистики в полночь и обновления недельной/месячной
  async resetDailyEarnings(): Promise<void> {
    try {
      // Получаем текущую дату
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Получаем дату вчерашнего дня
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      console.log(`Запуск сброса дневной статистики заработка. Дата: ${todayStr}`);

      // Получаем всех работников
      const workers = await this.workersRepository.find();

      for (const worker of workers) {
        // Проверяем, есть ли запись на сегодня
        let todayStats = await this.earningStatsRepository.findOne({
          where: { workerId: worker.id, date: todayStr }
        });

        // Если запись на сегодня уже есть, пропускаем работника
        if (todayStats) {
          continue;
        }

        // Находим запись за вчера, если она есть
        const yesterdayStats = await this.earningStatsRepository.findOne({
          where: { workerId: worker.id, date: yesterdayStr }
        });

        // Создаем запись на сегодня с обнуленным дневным заработком
        todayStats = this.earningStatsRepository.create({
          workerId: worker.id,
          date: todayStr,
          dailyEarnings: 0,
          // Получаем статистику за неделю и месяц из предыдущих расчетов
          weeklyEarnings: yesterdayStats?.weeklyEarnings || 0,
          monthlyEarnings: yesterdayStats?.monthlyEarnings || 0
        });

        await this.earningStatsRepository.save(todayStats);
      }

      console.log('Сброс дневной статистики заработка успешно выполнен');
    } catch (error) {
      console.error('Ошибка при сбросе дневной статистики заработка:', error);
    }
  }
} 