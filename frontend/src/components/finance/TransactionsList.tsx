import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FinanceTransaction } from '@/types';

interface TransactionsListProps {
  transactions: FinanceTransaction[];
  title: string;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, title }) => {
  // Проверяем, есть ли транзакции
  const hasTransactions = Array.isArray(transactions) && transactions.length > 0;
  
  console.log('Отображаем транзакции:', transactions);
  
  if (!hasTransactions) {
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
          {title}
        </h2>
        
        <p style={{ color: '#9DA3AE' }}>Транзакции отсутствуют</p>
      </div>
    );
  }
  
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
        {title}
      </h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: '14px'
        }}>
          <thead>
            <tr>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px 16px', 
                borderBottom: '1px solid #333',
                color: '#9DA3AE'
              }}>
                Дата
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px 16px', 
                borderBottom: '1px solid #333',
                color: '#9DA3AE'
              }}>
                Сотрудник
              </th>
              <th style={{ 
                textAlign: 'right', 
                padding: '12px 16px', 
                borderBottom: '1px solid #333',
                color: '#9DA3AE'
              }}>
                Сумма
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px 16px', 
                borderBottom: '1px solid #333',
                color: '#9DA3AE'
              }}>
                Причина
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid #222',
                  color: 'white'
                }}>
                  {format(new Date(transaction.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid #222',
                  color: 'white'
                }}>
                  {transaction.username}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid #222',
                  color: '#FF5555',
                  textAlign: 'right',
                  fontWeight: 'bold'
                }}>
                  ${Number(transaction.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid #222',
                  color: 'white'
                }}>
                  {transaction.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsList; 