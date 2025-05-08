import React, { useState } from 'react';
import { createTransaction } from '@/lib/finance-api';
import { FinanceBank } from '@/types';

interface TransactionFormProps {
  onTransactionCreated: () => void;
  onBankUpdated?: (bank: FinanceBank) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onTransactionCreated, onBankUpdated }) => {
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const numericAmount = Number(amount);
      
      console.log('Создаем транзакцию:', { amount: numericAmount, reason });
      
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Пожалуйста, введите корректную сумму');
      }
      
      const result = await createTransaction(numericAmount, reason);
      console.log('Транзакция создана успешно:', result);
      
      if (onBankUpdated && result.bankBalance) {
        onBankUpdated(result.bankBalance);
      }
      
      setAmount('');
      setReason('');
      onTransactionCreated();
    } catch (error) {
      console.error('Ошибка при создании транзакции:', error);
      alert(error instanceof Error ? error.message : 'Не удалось создать транзакцию');
    } finally {
      setIsLoading(false);
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
        Взять средства из банка
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px'
        }}>
          <div>
            <label style={{ color: '#9DA3AE', display: 'block', marginBottom: '4px' }}>
              Сумма ($):
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1A1A1A',
                border: '1px solid #333',
                borderRadius: '4px',
                color: 'white'
              }}
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label style={{ color: '#9DA3AE', display: 'block', marginBottom: '4px' }}>
              Причина:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1A1A1A',
                border: '1px solid #333',
                borderRadius: '4px',
                color: 'white',
                minHeight: '80px',
                resize: 'vertical'
              }}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#76ABAE',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Создание...' : 'Взять средства'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm; 