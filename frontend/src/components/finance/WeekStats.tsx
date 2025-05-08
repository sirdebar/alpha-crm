import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FinanceWeekStats } from '@/types';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from 'recharts';

interface WeekStatsProps {
  stats: FinanceWeekStats;
}

const WeekStats: React.FC<WeekStatsProps> = ({ stats }) => {
  // Проверка наличия данных
  if (!stats || !stats.dailyStats) {
    console.error('Нет данных статистики:', stats);
    return (
      <div style={{ backgroundColor: '#141414', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
        <h2 style={{ color: 'white', fontSize: '18px' }}>Статистика недоступна</h2>
        <p style={{ color: '#9DA3AE' }}>Данные статистики отсутствуют или загружаются.</p>
      </div>
    );
  }
  
  useEffect(() => {
    console.log('Данные для WeekStats:', stats);
  }, [stats]);
  
  // Сортируем по дате
  const sortedStats = [...stats.dailyStats].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Форматируем данные для графика
  const chartData = sortedStats.map(day => ({
    name: format(new Date(day.date), 'EEE', { locale: ru }),
    date: day.date,
    amount: day.totalAmount || 0, // Защита от null/undefined
    count: day.transactionsCount || 0 // Защита от null/undefined
  }));
  
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
        Недельная статистика
      </h2>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ color: '#9DA3AE', fontSize: '14px' }}>
            Всего транзакций за неделю
          </div>
          <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
            {stats.totalTransactions}
          </div>
        </div>
        
        <div>
          <div style={{ color: '#9DA3AE', fontSize: '14px' }}>
            Доступная сумма
          </div>
          <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
            ${Number(stats.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
      </div>
      
      {chartData.length > 0 && (
        <div style={{ 
          height: '300px', 
          marginTop: '20px'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9DA3AE' }} 
              />
              <YAxis 
                tick={{ fill: '#9DA3AE' }} 
                width={80}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: any) => [`$${Number(value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Сумма']}
                labelFormatter={(label) => {
                  const dayData = chartData.find(d => d.name === label);
                  return dayData 
                    ? `${format(new Date(dayData.date), 'EEEE, d MMMM', { locale: ru })}`
                    : label;
                }}
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333',
                  color: 'white',
                  borderRadius: '4px'
                }}
              />
              <Bar 
                dataKey="amount" 
                name="Сумма" 
                fill="#76ABAE" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          color: '#9DA3AE', 
          marginBottom: '12px' 
        }}>
          Детализация по дням
        </h3>
        
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: '14px'
        }}>
          <thead>
            <tr>
              <th style={{ 
                textAlign: 'left', 
                padding: '10px', 
                borderBottom: '1px solid #333',
                color: '#9DA3AE'
              }}>
                День
              </th>
              <th style={{ 
                textAlign: 'right', 
                padding: '10px', 
                borderBottom: '1px solid #333',
                color: '#9DA3AE'
              }}>
                Транзакций
              </th>
              <th style={{ 
                textAlign: 'right', 
                padding: '10px', 
                borderBottom: '1px solid #333',
                color: '#9DA3AE'
              }}>
                Сумма
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((day) => (
              <tr key={day.date}>
                <td style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid #222',
                  color: 'white'
                }}>
                  {format(new Date(day.date), 'EEEE, d MMMM', { locale: ru })}
                </td>
                <td style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid #222',
                  color: 'white',
                  textAlign: 'right'
                }}>
                  {day.transactionsCount}
                </td>
                <td style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid #222',
                  color: day.totalAmount > 0 ? '#FF5555' : 'white',
                  textAlign: 'right',
                  fontWeight: day.totalAmount > 0 ? 'bold' : 'normal'
                }}>
                  {day.totalAmount > 0 ? `$${Number(day.totalAmount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeekStats; 