import { FinanceBank, FinanceTransaction, FinanceWeekStats } from '@/types';
import { api } from './api';

export const getCurrentBank = async (): Promise<FinanceBank | null> => {
  try {
    console.log('Отправка запроса getCurrentBank...');
    const response = await api.get('/finance/bank');
    console.log('Получен ответ от getCurrentBank:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при получении текущего банка:', error);
    if (error instanceof Error) {
      console.error('Детали ошибки:', error.message);
    }
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
    if (error instanceof Error) {
      console.error('Детали ошибки:', error.message);
    }
    
    // Пробуем создать банк через API обновления
    try {
      console.log('Пробуем создать банк через updateBank...');
      const newBank = await updateBank(1000);
      console.log('Создан банк через updateBank:', newBank);
      return newBank;
    } catch (updateError) {
      console.error('Не удалось создать банк через updateBank:', updateError);
      if (updateError instanceof Error) {
        console.error('Детали ошибки updateBank:', updateError.message);
      }
      return null;
    }
  }
};

export const updateBank = async (amount: number): Promise<FinanceBank> => {
  console.log('finance-api: отправляем запрос на обновление банка, сумма:', amount);
  try {
    const response = await api.patch('/finance/bank', { amount });
    console.log('Получен ответ от updateBank:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при обновлении банка:', error);
    if (error instanceof Error) {
      console.error('Детали ошибки updateBank:', error.message);
    }
    throw error;
  }
};

export const createTransaction = async (amount: number, reason: string): Promise<{transaction: FinanceTransaction, bankBalance: FinanceBank}> => {
  try {
    console.log('Отправка запроса на создание транзакции, данные:', { amount, reason });
    const response = await api.post('/finance/transaction', { amount, reason });
    console.log('Получен ответ от createTransaction:', response);
    
    // Проверяем, если сервер уже вернул данные в новом формате с банком
    if (response.bank && response.transaction) {
      return {
        transaction: response.transaction,
        bankBalance: response.bank
      };
    }
    
    // Если сервер еще не обновлен и возвращает старый формат,
    // делаем дополнительный запрос для получения банка
    console.log('Запрос на получение банка после транзакции...');
    const bankBalance = await getCurrentBank();
    console.log('Получен банк после транзакции:', bankBalance);
    return {
      transaction: response,
      bankBalance: bankBalance || { id: 0, amount: 0, weekStart: '', weekEnd: '', updatedAt: '' }
    };
  } catch (error) {
    console.error('Ошибка при создании транзакции:', error);
    if (error instanceof Error) {
      console.error('Детали ошибки createTransaction:', error.message);
    }
    throw error;
  }
};

export const getMyTransactions = async (): Promise<FinanceTransaction[]> => {
  try {
    console.log('Запрос на получение моих транзакций...');
    const response = await api.get('/finance/transactions/my');
    console.log('Получены мои транзакции:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error);
    if (error instanceof Error) {
      console.error('Детали ошибки getMyTransactions:', error.message);
    }
    return [];
  }
};

export const getAllTransactions = async (): Promise<FinanceTransaction[]> => {
  try {
    console.log('Запрос на получение всех транзакций...');
    const response = await api.get('/finance/transactions/all');
    console.log('Получены все транзакции:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при получении всех транзакций:', error);
    if (error instanceof Error) {
      console.error('Детали ошибки getAllTransactions:', error.message);
    }
    return [];
  }
};

export const getWeekStats = async (): Promise<FinanceWeekStats> => {
  try {
    console.log('Запрос на получение недельной статистики...');
    const response = await api.get('/finance/stats/week');
    console.log('Получена недельная статистика:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при получении недельной статистики:', error);
    if (error instanceof Error) {
      console.error('Детали ошибки getWeekStats:', error.message);
    }
    throw error;
  }
}; 