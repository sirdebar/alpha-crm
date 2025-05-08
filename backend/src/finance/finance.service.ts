import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { FinanceBank } from './entities/finance-bank.entity';
import { FinanceTransaction } from './entities/finance-transaction.entity';
import { UpdateBankDto } from './dto/update-bank.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../users/entities/user.entity';
import { startOfWeek, endOfWeek, subDays, format, addHours } from 'date-fns';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceBank)
    private financeBankRepository: Repository<FinanceBank>,
    @InjectRepository(FinanceTransaction)
    private financeTransactionRepository: Repository<FinanceTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Получить текущий финансовый банк без создания нового
  async getCurrentBank() {
    const now = new Date();
    // Для российских дат: начало недели с понедельника (1), конец - суббота
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = subDays(endOfWeek(now, { weekStartsOn: 1 }), 1); // Суббота
    
    console.log('Поиск банка. Текущая дата:', now, 'Период:', { weekStart, weekEnd });
    
    // Сначала ищем банк за текущую неделю
    let bank = await this.financeBankRepository.findOne({
      where: {
        weekStart: new Date(weekStart.setHours(0, 0, 0, 0)),
        weekEnd: new Date(weekEnd.setHours(23, 59, 59, 999)),
      },
      order: { createdAt: 'DESC' },
    });
    
    // Если банк не найден по точным датам недели, ищем активный банк (более гибкий поиск)
    if (!bank) {
      bank = await this.financeBankRepository.findOne({
        where: [
          {
            weekStart: LessThanOrEqual(now),
            weekEnd: Between(now, addHours(now, 24)),
          }
        ],
        order: { createdAt: 'DESC' },
      });
    }
    
    // Если банк всё еще не найден, возвращаем null
    if (!bank) {
      console.log('Банк не найден');
      return null;
    }
    
    console.log('Найден существующий банк:', bank);

    return {
      id: bank.id,
      amount: bank.amount,
      weekStart: format(bank.weekStart, 'yyyy-MM-dd'),
      weekEnd: format(bank.weekEnd, 'yyyy-MM-dd'),
      updatedAt: bank.updatedAt.toISOString(),
    };
  }
  
  // Инициализация банка (для первого запуска)
  async initializeBank() {
    // Сначала проверяем, нет ли уже банка
    const existingBank = await this.getCurrentBank();
    if (existingBank) {
      return existingBank;
    }
    
    // Создаем новый банк
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = subDays(endOfWeek(now, { weekStartsOn: 1 }), 1); // Суббота
    
    console.log('Инициализация банка. Текущая дата:', now, 'Период:', { weekStart, weekEnd });
    
    const newBank = this.financeBankRepository.create({
      amount: 1000, // Начальная сумма
      weekStart,
      weekEnd,
    });
    
    await this.financeBankRepository.save(newBank);
    console.log('Создан новый банк:', newBank);
    
    return {
      id: newBank.id,
      amount: newBank.amount,
      weekStart: format(newBank.weekStart, 'yyyy-MM-dd'),
      weekEnd: format(newBank.weekEnd, 'yyyy-MM-dd'),
      updatedAt: newBank.updatedAt.toISOString(),
    };
  }

  // Создать транзакцию (эйчар берет деньги)
  async createTransaction(userId: number, createTransactionDto: CreateTransactionDto) {
    // Получаем текущий банк без создания нового
    const bank = await this.getCurrentBank();
    
    // Если банк не найден, инициализируем новый
    if (!bank) {
      const newBank = await this.initializeBank();
      return this.createTransaction(userId, createTransactionDto); // Рекурсивно вызываем себя с новым банком
    }
    
    // Проверяем достаточно ли средств
    if (bank.amount < createTransactionDto.amount) {
      throw new BadRequestException('Недостаточно средств в банке');
    }
    
    // Создаем транзакцию
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    
    const transaction = this.financeTransactionRepository.create({
      userId: user.id,
      amount: createTransactionDto.amount,
      reason: createTransactionDto.reason,
    });
    
    // Уменьшаем сумму в банке
    const bankId = parseInt(bank.id.toString(), 10);
    const newAmount = bank.amount - createTransactionDto.amount;
    
    await this.financeBankRepository.update(bankId, {
      amount: newAmount,
    });
    
    await this.financeTransactionRepository.save(transaction);
    
    // Получаем обновленный банк для возврата
    const updatedBank = await this.financeBankRepository.findOne({
      where: { id: bankId },
    });
    
    if (!updatedBank) {
      throw new NotFoundException('Банк не найден после обновления');
    }
    
    return {
      transaction: {
        id: transaction.id,
        userId: transaction.userId,
        username: user.username,
        amount: transaction.amount,
        reason: transaction.reason,
        createdAt: transaction.createdAt.toISOString(),
      },
      bank: {
        id: updatedBank.id,
        amount: updatedBank.amount,
        weekStart: format(updatedBank.weekStart, 'yyyy-MM-dd'),
        weekEnd: format(updatedBank.weekEnd, 'yyyy-MM-dd'),
        updatedAt: updatedBank.updatedAt.toISOString(),
      }
    };
  }

  // Обновить текущий банк (только админ)
  async updateBank(updateBankDto: UpdateBankDto) {
    // Получаем текущий банк
    let bank = await this.getCurrentBank();
    
    // Если банк не найден, инициализируем новый
    if (!bank) {
      bank = await this.initializeBank();
    }
    
    console.log('Обновление банка, ID:', bank.id, 'Новая сумма:', updateBankDto.amount);
    
    // Убедимся, что сумма - это число
    const amount = typeof updateBankDto.amount === 'string' 
      ? parseFloat(updateBankDto.amount) 
      : updateBankDto.amount;
    
    // Проверка на NaN и отрицательные значения
    if (isNaN(amount)) {
      throw new BadRequestException('Неверный формат суммы');
    }
    
    if (amount < 0) {
      throw new BadRequestException('Сумма не может быть отрицательной');
    }
    
    try {
      await this.financeBankRepository.update(bank.id, {
        amount: amount,
      });
      
      console.log('Запрос обновления выполнен успешно');
      
      const updatedBank = await this.financeBankRepository.findOne({
        where: { id: bank.id },
      });
      
      if (!updatedBank) {
        throw new Error('Не удалось найти обновленный банк');
      }
      
      console.log('Банк успешно обновлен, новая сумма:', updatedBank.amount);
      
      return {
        id: updatedBank.id,
        amount: updatedBank.amount,
        weekStart: format(updatedBank.weekStart, 'yyyy-MM-dd'),
        weekEnd: format(updatedBank.weekEnd, 'yyyy-MM-dd'),
        updatedAt: updatedBank.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Ошибка при обновлении банка:', error);
      throw new BadRequestException('Не удалось обновить сумму в банке');
    }
  }

  // Получить последние транзакции пользователя
  async getUserTransactions(userId: number, limit = 5) {
    const transactions = await this.financeTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
    
    return transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      username: transaction.user.username,
      amount: transaction.amount,
      reason: transaction.reason,
      createdAt: transaction.createdAt.toISOString(),
    }));
  }

  // Получить все транзакции (для админа)
  async getAllTransactions(limit = 10) {
    const transactions = await this.financeTransactionRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
    
    return transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      username: transaction.user.username,
      amount: transaction.amount,
      reason: transaction.reason,
      createdAt: transaction.createdAt.toISOString(),
    }));
  }

  // Получить недельную статистику (для админа)
  async getWeekStats() {
    // Получаем текущий банк
    let bank = await this.getCurrentBank();
    
    // Если банк не найден, инициализируем его
    if (!bank) {
      bank = await this.initializeBank();
    }
    
    // Получаем начало и конец недели из банка
    const startDate = new Date(bank.weekStart);
    const endDate = new Date(bank.weekEnd);
    
    const transactions = await this.financeTransactionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['user'],
    });
    
    const totalTransactions = transactions.length;
    
    // Группируем транзакции по дням
    const dailyStats = [];
    const daysMap = new Map();
    
    // Инициализация дней недели
    for (let i = 0; i < 6; i++) { // Понедельник до субботы
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      daysMap.set(formattedDate, {
        date: formattedDate,
        totalAmount: 0,
        transactionsCount: 0,
      });
    }
    
    // Заполнение статистики
    transactions.forEach(transaction => {
      const day = format(transaction.createdAt, 'yyyy-MM-dd');
      if (daysMap.has(day)) {
        const stats = daysMap.get(day);
        stats.totalAmount += transaction.amount;
        stats.transactionsCount += 1;
      }
    });
    
    // Конвертация Map в массив
    daysMap.forEach(value => {
      dailyStats.push(value);
    });
    
    return {
      totalAmount: bank.amount,
      totalTransactions,
      dailyStats,
    };
  }
} 