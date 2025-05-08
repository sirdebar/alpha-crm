"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { UserRole, FinanceBank, FinanceTransaction, FinanceWeekStats } from "@/types";
import FinanceBankComponent from "@/components/finance/FinanceBank";
import TransactionForm from "@/components/finance/TransactionForm";
import TransactionsList from "@/components/finance/TransactionsList";
import WeekStats from "@/components/finance/WeekStats";
import { getCurrentBank, getMyTransactions, getAllTransactions, getWeekStats, initializeBank, updateBank, createBank, getBankOrCreate } from "@/lib/finance-api";

export default function FinancePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bank, setBank] = useState<FinanceBank | null>(null);
  const [myTransactions, setMyTransactions] = useState<FinanceTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<FinanceTransaction[]>([]);
  const [weekStats, setWeekStats] = useState<FinanceWeekStats | null>(null);
  
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Полная загрузка данных
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Загрузка данных финансов...');
      
      // Пробуем разные стратегии получения/создания банка
      let bankData = null;
      const strategies = [
        // 1. Обычное получение через getCurrentBank
        async () => {
          console.log('Стратегия 1: получение через getCurrentBank');
          return await getCurrentBank();
        },
        // 2. Инициализация через initializeBank
        async () => {
          console.log('Стратегия 2: инициализация через initializeBank');
          return await initializeBank();
        },
        // 3. Получение или создание через getBankOrCreate
        async () => {
          console.log('Стратегия 3: получение или создание через getBankOrCreate');
          return await getBankOrCreate();
        },
        // 4. Принудительное создание через createBank
        async () => {
          console.log('Стратегия 4: принудительное создание через createBank');
          return await createBank(1000);
        },
        // 5. Обновление через updateBank
        async () => {
          console.log('Стратегия 5: обновление через updateBank');
          return await updateBank(1000);
        }
      ];
      
      // Перебираем стратегии, пока не получим результат
      for (const strategy of strategies) {
        try {
          const result = await strategy();
          if (result) {
            console.log('Стратегия успешна:', result);
            bankData = result;
            break;
          }
        } catch (strategyError) {
          console.error('Ошибка стратегии:', strategyError);
          // Продолжаем следующую стратегию
        }
      }
      
      // Если ни одна стратегия не сработала
      if (!bankData) {
        if (isAdmin) {
          setError('Не удалось инициализировать банк, несмотря на все попытки. Проверьте логи сервера.');
        } else {
          setError('Банк не инициализирован. Пожалуйста, обратитесь к администратору.');
        }
        setLoading(false);
        return;
      }
      
      console.log('Полученные данные банка:', bankData);
      setBank(bankData);
      
      // Загружаем транзакции текущего пользователя
      const myTxData = await getMyTransactions();
      console.log('Мои транзакции:', myTxData);
      setMyTransactions(Array.isArray(myTxData) ? myTxData : []);
      
      // Для админа загружаем дополнительные данные
      if (isAdmin) {
        console.log('Загрузка данных для админа...');
        
        try {
          const allTxData = await getAllTransactions();
          console.log('Все транзакции:', allTxData);
          setAllTransactions(Array.isArray(allTxData) ? allTxData : []);
        } catch (txError) {
          console.error('Ошибка при загрузке всех транзакций:', txError);
        }
        
        try {
          const statsData = await getWeekStats();
          console.log('Статистика недели:', statsData);
          setWeekStats(statsData);
        } catch (statsError) {
          console.error('Ошибка при загрузке недельной статистики:', statsError);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setError('Произошла ошибка при загрузке финансовых данных. Проверьте консоль для деталей.');
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для загрузки только транзакций (без обновления всего банка)
  const loadTransactions = async () => {
    try {
      // Загружаем транзакции текущего пользователя
      const myTxData = await getMyTransactions();
      console.log('Обновлены мои транзакции:', myTxData);
      setMyTransactions(Array.isArray(myTxData) ? myTxData : []);
      
      // Для админа загружаем все транзакции
      if (isAdmin) {
        const allTxData = await getAllTransactions();
        console.log('Обновлены все транзакции:', allTxData);
        setAllTransactions(Array.isArray(allTxData) ? allTxData : []);
      }
    } catch (error) {
      console.error('Ошибка при загрузке транзакций:', error);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  if (loading || !user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9DA3AE' }}>
        Загрузка данных финансов...
      </div>
    );
  }
  
  if (error || !bank) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#FF5555', marginBottom: '20px' }}>
          {error || 'Не удалось загрузить данные о финансах'}
        </div>
        
        {isAdmin && (
          <div style={{ marginBottom: '20px', border: '1px solid #333', padding: '15px', borderRadius: '8px', backgroundColor: '#1A1A1A' }}>
            <h3 style={{ color: '#76ABAE', marginBottom: '10px' }}>Инструменты администратора</h3>
            <div style={{ color: '#9DA3AE', marginBottom: '10px', textAlign: 'left' }}>
              <p>Обнаружена проблема с инициализацией банка. Пожалуйста, выполните следующие действия для диагностики:</p>
              <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
                <li>Откройте консоль разработчика в браузере (F12)</li>
                <li>Проверьте наличие ошибок в логах</li>
                <li>Попробуйте восстановить банк, используя один из методов ниже</li>
              </ol>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={async () => {
                  try {
                    console.log('Инициализация через GET запрос...');
                    const bank = await getCurrentBank();
                    if (bank) {
                      console.log('Банк успешно получен:', bank);
                      alert('Банк успешно получен! Нажмите "Повторить загрузку".');
                    } else {
                      console.error('Не удалось получить банк');
                      alert('Не удалось получить банк. Проверьте консоль.');
                    }
                  } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Ошибка: ' + (error.message || 'Неизвестная ошибка'));
                  }
                }}
                style={{
                  backgroundColor: '#76ABAE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                Получить банк
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    console.log('Инициализация через initializeBank...');
                    const bank = await initializeBank();
                    if (bank) {
                      console.log('Банк успешно инициализирован:', bank);
                      alert('Банк успешно инициализирован! Нажмите "Повторить загрузку".');
                    } else {
                      console.error('Не удалось инициализировать банк');
                      alert('Не удалось инициализировать банк. Проверьте консоль.');
                    }
                  } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Ошибка: ' + (error.message || 'Неизвестная ошибка'));
                  }
                }}
                style={{
                  backgroundColor: '#4A90E2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                Инициализировать банк
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    console.log('Получение или создание банка...');
                    const bank = await getBankOrCreate();
                    if (bank) {
                      console.log('Банк успешно получен или создан:', bank);
                      alert('Банк успешно получен или создан! Нажмите "Повторить загрузку".');
                    } else {
                      console.error('Не удалось получить или создать банк');
                      alert('Не удалось получить или создать банк. Проверьте консоль.');
                    }
                  } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Ошибка: ' + (error.message || 'Неизвестная ошибка'));
                  }
                }}
                style={{
                  backgroundColor: '#50C878',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                Получить или создать
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    console.log('Создание банка через POST...');
                    const bank = await createBank(1000);
                    if (bank) {
                      console.log('Банк успешно создан через POST:', bank);
                      alert('Банк успешно создан! Нажмите "Повторить загрузку".');
                    } else {
                      console.error('Не удалось создать банк через POST');
                      alert('Не удалось создать банк. Проверьте консоль.');
                    }
                  } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Ошибка: ' + (error.message || 'Неизвестная ошибка'));
                  }
                }}
                style={{
                  backgroundColor: '#FF6B6B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                Создать банк (POST)
              </button>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '16px' }}>
          <button 
            onClick={loadData}
            style={{
              backgroundColor: '#76ABAE',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 20px',
              cursor: 'pointer'
            }}
          >
            Повторить загрузку
          </button>
        </div>
      </div>
    );
  }

  // Если дошли до этой точки, значит user точно не null
  const userRole = user.role;
 
  // Добавляем обработчик обновления банка
  const handleBankUpdate = (updatedBank: FinanceBank) => {
    console.log('Обновляем данные о банке:', updatedBank);
    setBank(updatedBank);
    
    // После обновления банка загружаем новые транзакции
    loadTransactions();
  };

  // Обработчик создания транзакции
  const handleTransactionCreated = async () => {
    // Сначала загружаем транзакции, чтобы они обновились быстрее
    await loadTransactions();
    
    // Затем обновляем остальные данные
    if (isAdmin) {
      const statsData = await getWeekStats();
      setWeekStats(statsData);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        color: 'white'
      }}>
        Финансы
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Банк (доступен всем) */}
        <FinanceBankComponent 
          bank={bank} 
          userRole={userRole} 
          onUpdate={loadData} 
        />
        
        {/* Форма для взятия денег из банка (доступна всем) */}
        <TransactionForm 
          onTransactionCreated={handleTransactionCreated} 
          onBankUpdated={handleBankUpdate}  
        />
      </div>
      
      {/* Мои транзакции (доступны всем) */}
      <TransactionsList 
        transactions={myTransactions} 
        title="Мои последние транзакции" 
      />
      
      {/* Блоки доступные только для админа */}
      {isAdmin && weekStats && (
        <WeekStats stats={weekStats} />
      )}
      
      {isAdmin && (
        <TransactionsList 
          transactions={allTransactions} 
          title="Все транзакции" 
        />
      )}
    </div>
  );
} 