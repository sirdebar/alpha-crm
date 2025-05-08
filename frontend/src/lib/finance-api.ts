import { FinanceBank, FinanceTransaction, FinanceWeekStats } from '@/types';
import { api } from './api';

export const getCurrentBank = async (): Promise<FinanceBank | null> => {
  try {
    const response = await api.get('/api/finance/bank');
    return response;
  } catch (error) {
    console.error('Ошибка при получении текущего банка:', error);
    return null;
  }
};

export const initializeBank = async (): Promise<FinanceBank> => {
  return api.get('/api/finance/bank/init');
};

export const updateBank = async (amount: number): Promise<FinanceBank> => {
  console.log('finance-api: отправляем запрос на обновление банка, сумма:', amount);
  return api.patch('/api/finance/bank', { amount });
};

export const createTransaction = async (amount: number, reason: string): Promise<{transaction: FinanceTransaction, bankBalance: FinanceBank}> => {
  const response = await api.post('/api/finance/transaction', { amount, reason });
  
  // Проверяем, если сервер уже вернул данные в новом формате с банком
  if (response.bank && response.transaction) {
    return {
      transaction: response.transaction,
      bankBalance: response.bank
    };
  }
  
  // Если сервер еще не обновлен и возвращает старый формат,
  // делаем дополнительный запрос для получения банка
  const bankBalance = await getCurrentBank();
  return {
    transaction: response,
    bankBalance
  };
};

export const getMyTransactions = async (): Promise<FinanceTransaction[]> => {
  return api.get('/api/finance/transactions/my');
};

export const getAllTransactions = async (): Promise<FinanceTransaction[]> => {
  return api.get('/api/finance/transactions/all');
};

export const getWeekStats = async (): Promise<FinanceWeekStats> => {
  return api.get('/api/finance/stats/week');
}; 