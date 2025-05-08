import { FinanceBank, FinanceTransaction, FinanceWeekStats } from '@/types';
import { api } from './api';

export const getCurrentBank = async (): Promise<FinanceBank | null> => {
  try {
    const response = await api.get('/finance/bank');
    console.log('Получен ответ от getCurrentBank:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при получении текущего банка:', error);
    return null;
  }
};

export const initializeBank = async (): Promise<FinanceBank | null> => {
  try {
    console.log('Отправка запроса на инициализацию банка...');
    const response = await api.get('/finance/bank/init');
    console.log('Получен ответ от initializeBank:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при инициализации банка:', error);
    // Пробуем создать банк через API обновления
    try {
      console.log('Пробуем создать банк через updateBank...');
      const newBank = await updateBank(1000);
      console.log('Создан банк через updateBank:', newBank);
      return newBank;
    } catch (updateError) {
      console.error('Не удалось создать банк через updateBank:', updateError);
      return null;
    }
  }
};

export const updateBank = async (amount: number): Promise<FinanceBank> => {
  console.log('finance-api: отправляем запрос на обновление банка, сумма:', amount);
  const response = await api.patch('/finance/bank', { amount });
  console.log('Получен ответ от updateBank:', response);
  return response;
};

export const createTransaction = async (amount: number, reason: string): Promise<{transaction: FinanceTransaction, bankBalance: FinanceBank}> => {
  const response = await api.post('/finance/transaction', { amount, reason });
  
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
  return api.get('/finance/transactions/my');
};

export const getAllTransactions = async (): Promise<FinanceTransaction[]> => {
  return api.get('/finance/transactions/all');
};

export const getWeekStats = async (): Promise<FinanceWeekStats> => {
  return api.get('/finance/stats/week');
}; 