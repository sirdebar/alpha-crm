"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { UserRole, FinanceBank, FinanceTransaction, FinanceWeekStats } from "@/types";
import FinanceBankComponent from "@/components/finance/FinanceBank";
import TransactionForm from "@/components/finance/TransactionForm";
import TransactionsList from "@/components/finance/TransactionsList";
import WeekStats from "@/components/finance/WeekStats";
import { getCurrentBank, getMyTransactions, getAllTransactions, getWeekStats, initializeBank, forceInitializeBank } from "@/lib/finance-api";

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
      
      // Загружаем банк для всех
      let bankData = await getCurrentBank();
      
      // Если банк не найден, инициализируем его (только админ может инициализировать)
      if (!bankData && isAdmin) {
        console.log('Банк не найден, инициализируем...');
        try {
          bankData = await initializeBank();
          console.log('Банк успешно инициализирован:', bankData);
        } catch (initError) {
          console.error('Ошибка при инициализации банка:', initError);
          setError('Не удалось инициализировать банк. Пожалуйста, обратитесь к администратору.');
          setLoading(false);
          return;
        }
      } else if (!bankData) {
        console.error('Банк не найден, и текущий пользователь не имеет прав для инициализации');
        setError('Банк не инициализирован. Пожалуйста, обратитесь к администратору.');
        setLoading(false);
        return;
      }
      
      console.log('Полученные данные банка:', bankData);
      
      if (bankData) {
        setBank(bankData);
      } else {
        console.error('Получены пустые данные банка');
        setError('Не удалось загрузить данные о финансах');
      }
      
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
      setError('Произошла ошибка при загрузке финансовых данных');
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
      <div style={{ padding: '20px', textAlign: 'center', color: '#FF5555' }}>
        {error || 'Не удалось загрузить данные о финансах'}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
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
          
          <button 
            onClick={async () => {
              try {
                setError("Выполняется принудительная инициализация банка...");
                const bankData = await forceInitializeBank();
                if (bankData) {
                  setBank(bankData);
                  setError(null);
                  // После успешной инициализации банка загружаем остальные данные
                  loadData();
                } else {
                  setError("Не удалось инициализировать банк даже принудительно. Возможна проблема с сервером.");
                }
              } catch (initError) {
                console.error('Ошибка при принудительной инициализации банка:', initError);
                setError("Ошибка при принудительной инициализации банка. Обратитесь к разработчику.");
              }
            }}
            style={{
              backgroundColor: '#d9534f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 20px',
              cursor: 'pointer'
            }}
          >
            Принудительная инициализация
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