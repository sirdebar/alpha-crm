import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { CuratorFinance } from './entities/curator-finance.entity';
import { 
  CuratorFinanceResponseDto, 
  UpdateCuratorFinanceDto, 
  CuratorFinanceStatsResponseDto,
  TopCuratorsResponseDto
} from './dto/curator-finance.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(CuratorFinance)
    private curatorFinanceRepository: Repository<CuratorFinance>,
    private usersService: UsersService,
  ) {
    // Инициализация задачи для ежемесячной блокировки записей
    this.scheduleLockFinanceRecords();
  }

  private scheduleLockFinanceRecords() {
    // Получаем текущую дату
    const now = new Date();
    
    // Устанавливаем время на первый день следующего месяца
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
    
    // Получаем разницу в миллисекундах
    const timeToNextMonth = nextMonth.getTime() - now.getTime();
    
    // Планируем первое выполнение
    setTimeout(() => {
      this.lockFinanceRecords();
      
      // Устанавливаем интервал для ежемесячного выполнения
      setInterval(this.lockFinanceRecords.bind(this), 30 * 24 * 60 * 60 * 1000);
    }, timeToNextMonth);
  }

  private async lockFinanceRecords() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const formattedLastMonth = this.formatMonthDate(lastMonth);
    
    // Помечаем все записи прошлого месяца как заблокированные
    const records = await this.curatorFinanceRepository.find({
      where: { month: formattedLastMonth, locked: false }
    });
    
    for (const record of records) {
      record.locked = true;
      await this.curatorFinanceRepository.save(record);
    }
    
    // Создаем новые записи для текущего месяца
    const curators = await this.usersService.getCurators();
    const currentMonth = this.formatMonthDate(today);
    
    for (const curator of curators) {
      // Проверяем, существует ли уже запись на текущий месяц
      const existingRecord = await this.curatorFinanceRepository.findOne({
        where: { curatorId: curator.id, month: currentMonth }
      });
      
      if (!existingRecord) {
        const newRecord = this.curatorFinanceRepository.create({
          curatorId: curator.id,
          profit: 0,
          expenses: 0,
          month: currentMonth,
          locked: false
        });
        
        await this.curatorFinanceRepository.save(newRecord);
      }
    }
  }

  // Форматирует дату для записи в поле month (YYYY-MM-01)
  private formatMonthDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  // Получить или создать запись о финансах для указанного куратора за текущий месяц
  async getCuratorFinanceOrCreate(curatorId: number): Promise<CuratorFinanceResponseDto> {
    // Проверяем, существует ли куратор
    const curator = await this.usersService.findById(curatorId);
    if (!curator || curator.role !== UserRole.CURATOR) {
      throw new NotFoundException(`Куратор с ID ${curatorId} не найден`);
    }
    
    // Получаем текущий месяц в формате YYYY-MM-01
    const today = new Date();
    const currentMonth = this.formatMonthDate(today);
    
    // Ищем существующую запись
    let financeRecord = await this.curatorFinanceRepository.findOne({
      where: { curatorId, month: currentMonth }
    });
    
    // Если запись не найдена, создаем новую
    if (!financeRecord) {
      financeRecord = this.curatorFinanceRepository.create({
        curatorId,
        profit: 0,
        expenses: 0,
        month: currentMonth,
        locked: false
      });
      
      await this.curatorFinanceRepository.save(financeRecord);
    }
    
    return financeRecord;
  }

  // Обновить данные о финансах куратора за текущий месяц
  async updateCuratorFinance(curatorId: number, updateDto: UpdateCuratorFinanceDto): Promise<CuratorFinanceResponseDto> {
    // Получаем или создаем запись
    const financeRecord = await this.getCuratorFinanceOrCreate(curatorId);
    
    // Проверяем, не заблокирована ли запись
    if (financeRecord.locked) {
      throw new Error('Нельзя изменять заблокированную запись');
    }
    
    // Обновляем данные
    if (updateDto.profit !== undefined) {
      financeRecord.profit = updateDto.profit;
    }
    
    if (updateDto.expenses !== undefined) {
      financeRecord.expenses = updateDto.expenses;
    }
    
    // Сохраняем обновленную запись
    return this.curatorFinanceRepository.save(financeRecord);
  }

  // Получить историю финансов куратора за несколько месяцев
  async getCuratorFinanceHistory(curatorId: number, months: number = 6): Promise<CuratorFinanceResponseDto[]> {
    // Проверяем, существует ли куратор
    const curator = await this.usersService.findById(curatorId);
    if (!curator || curator.role !== UserRole.CURATOR) {
      throw new NotFoundException(`Куратор с ID ${curatorId} не найден`);
    }
    
    // Вычисляем дату начала периода (месяцев назад от текущего месяца)
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - months + 1, 1);
    const formattedStartDate = this.formatMonthDate(startDate);
    
    // Получаем записи за указанный период
    const records = await this.curatorFinanceRepository.find({
      where: { 
        curatorId,
        month: MoreThanOrEqual(formattedStartDate)
      },
      order: { month: 'ASC' }
    });
    
    return records;
  }

  // Получить топ кураторов по профиту за указанный месяц
  async getTopCurators(month?: string, limit: number = 3): Promise<TopCuratorsResponseDto> {
    // Если месяц не указан, используем текущий
    const targetMonth = month || this.formatMonthDate(new Date());
    
    // Получаем все записи за указанный месяц
    const records = await this.curatorFinanceRepository.find({
      where: { month: targetMonth },
      relations: ['curator']
    });
    
    // Собираем статистику по кураторам
    const curatorStats: CuratorFinanceStatsResponseDto[] = [];
    let totalProfit = 0;
    let totalExpenses = 0;
    
    for (const record of records) {
      const netProfit = record.profit - record.expenses;
      
      curatorStats.push({
        curatorId: record.curatorId,
        curatorName: record.curator.username,
        profit: record.profit,
        expenses: record.expenses,
        netProfit
      });
      
      totalProfit += record.profit;
      totalExpenses += record.expenses;
    }
    
    // Сортируем по чистой прибыли (profit - expenses) в порядке убывания
    curatorStats.sort((a, b) => b.netProfit - a.netProfit);
    
    // Ограничиваем количество результатов
    const topCurators = curatorStats.slice(0, limit);
    
    return {
      topCurators,
      totalProfit,
      totalExpenses
    };
  }

  // Получить статистику по всем кураторам за указанный месяц
  async getAllCuratorsStats(month?: string): Promise<CuratorFinanceStatsResponseDto[]> {
    // Если месяц не указан, используем текущий
    const targetMonth = month || this.formatMonthDate(new Date());
    
    // Получаем всех кураторов
    const curators = await this.usersService.getCurators();
    
    // Получаем все записи за указанный месяц
    const records = await this.curatorFinanceRepository.find({
      where: { month: targetMonth }
    });
    
    // Собираем статистику по всем кураторам
    const result: CuratorFinanceStatsResponseDto[] = [];
    
    for (const curator of curators) {
      const record = records.find(r => r.curatorId === curator.id);
      
      const profit = record ? record.profit : 0;
      const expenses = record ? record.expenses : 0;
      const netProfit = profit - expenses;
      
      result.push({
        curatorId: curator.id,
        curatorName: curator.username,
        profit,
        expenses,
        netProfit
      });
    }
    
    // Сортируем по чистой прибыли (profit - expenses) в порядке убывания
    result.sort((a, b) => b.netProfit - a.netProfit);
    
    return result;
  }
} 