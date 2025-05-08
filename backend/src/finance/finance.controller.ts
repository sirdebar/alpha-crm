import { Controller, Get, Post, Body, Patch, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateBankDto } from './dto/update-bank.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Получить текущий банк
  @Get('bank')
  async getCurrentBank(@Request() req) {
    return this.financeService.getCurrentBank();
  }

  // Инициализировать банк если его нет (для первого запуска)
  @Get('bank/init')
  async initBank(@Request() req) {
    // Только админ может инициализировать банк
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор может инициализировать банк');
    }
    return this.financeService.initializeBank();
  }

  // Принудительная инициализация банка (без проверки роли)
  @Get('bank/force-init')
  async forceInitBank() {
    console.log('Выполняется принудительная инициализация банка');
    return this.financeService.initializeBank();
  }

  // Обновить текущий банк (только админ)
  @Patch('bank')
  async updateBank(@Request() req, @Body() updateBankDto: UpdateBankDto) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор может изменять сумму в банке');
    }
    console.log('Полученные данные для обновления банка:', updateBankDto);
    console.log('Тип суммы:', typeof updateBankDto.amount);
    return this.financeService.updateBank(updateBankDto);
  }

  // Создать транзакцию (взять деньги из банка)
  @Post('transaction')
  async createTransaction(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    if (req.user.role !== UserRole.CURATOR && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только эйчары и администраторы могут брать деньги из банка');
    }
    
    console.log('Создание транзакции, сумма:', createTransactionDto.amount);
    const result = await this.financeService.createTransaction(req.user.id, createTransactionDto);
    console.log('Транзакция создана успешно, обновленный банк:', result.bank);
    
    return result;
  }

  // Получить свои последние транзакции
  @Get('transactions/my')
  async getMyTransactions(@Request() req) {
    return this.financeService.getUserTransactions(req.user.id);
  }

  // Получить все транзакции (для админа)
  @Get('transactions/all')
  async getAllTransactions(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор может просматривать все транзакции');
    }
    return this.financeService.getAllTransactions();
  }

  // Получить недельную статистику (для админа)
  @Get('stats/week')
  async getWeekStats(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор может просматривать недельную статистику');
    }
    return this.financeService.getWeekStats();
  }
} 