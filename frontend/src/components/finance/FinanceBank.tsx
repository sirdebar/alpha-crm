import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FinanceBank as FinanceBankType } from '@/types';
import { updateBank } from '@/lib/finance-api';

interface FinanceBankProps {
  bank: FinanceBankType;
  userRole: string;
  onUpdate: () => void;
}

const FinanceBank: React.FC<FinanceBankProps> = ({ bank, userRole, onUpdate }) => {
  const [amount, setAmount] = useState<string>(bank?.amount?.toString() || '0');
  const [isUpdating, setIsUpdating] = useState(false);
  const isAdmin = userRole === 'admin';
  
  // При получении новых данных о банке, обновляем значение в форме
  useEffect(() => {
    console.log('Получены данные о банке:', bank);
    if (bank && bank.amount !== undefined) {
      // Обновляем только если текущее значение в поле ввода не равно значению банка
      // Это предотвращает сброс значения в процессе редактирования
      if (!isUpdating && amount !== bank.amount.toString()) {
        setAmount(bank.amount.toString());
      }
    }
  }, [bank, isUpdating]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) return;
    
    try {
      setIsUpdating(true);
      const numericAmount = Number(amount);
      console.log('Отправляю обновление суммы:', numericAmount);
      
      const updatedBank = await updateBank(numericAmount);
      console.log('Получен ответ от сервера:', updatedBank);
      
      // Обновляем страницу после успешного обновления
      onUpdate();
    } catch (error) {
      console.error('Ошибка при обновлении банка:', error);
      alert('Не удалось обновить сумму в банке');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div style={{ 
      backgroundColor: '#141414', 
      padding: '20px', 
      borderRadius: '12px', 
      border: '1px solid #222',
      marginBottom: '20px'
    }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: 'white', 
        marginBottom: '16px' 
      }}>
        Финансовый банк
      </h2>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px'
      }}>
        <div>
          <span style={{ color: '#9DA3AE' }}>Текущая сумма:</span>
          <span style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '24px', 
            display: 'block', 
            marginTop: '4px' 
          }}>
            ${Number(bank.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
        
        <div>
          <span style={{ color: '#9DA3AE' }}>Период:</span>
          <span style={{ 
            color: 'white', 
            display: 'block', 
            marginTop: '4px' 
          }}>
            {format(new Date(bank.weekStart), 'dd MMMM yyyy', { locale: ru })} - 
            {format(new Date(bank.weekEnd), 'dd MMMM yyyy', { locale: ru })}
          </span>
        </div>
        
        <div>
          <span style={{ color: '#9DA3AE' }}>Последнее обновление:</span>
          <span style={{ 
            color: 'white', 
            display: 'block', 
            marginTop: '4px' 
          }}>
            {format(new Date(bank.updatedAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
          </span>
        </div>
        
        {isAdmin && (
          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px'
            }}>
              <label style={{ color: '#9DA3AE' }}>
                Установить новую сумму ($):
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: 'white',
                    marginTop: '4px'
                  }}
                  required
                />
              </label>
              
              <button 
                type="submit"
                disabled={isUpdating}
                style={{
                  backgroundColor: '#76ABAE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  opacity: isUpdating ? 0.7 : 1
                }}
              >
                {isUpdating ? 'Обновление...' : 'Обновить сумму'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FinanceBank; 