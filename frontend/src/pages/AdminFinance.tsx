import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Table, message } from 'antd';
import { api } from '../api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Finance {
  id: number;
  total_amount: number;
  week_start: string;
  week_end: string;
}

interface Transaction {
  id: number;
  amount: number;
  reason: string;
  user_id: number;
  created_at: string;
  user: {
    name: string;
  };
}

const AdminFinance: React.FC = () => {
  const [finance, setFinance] = useState<Finance | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchFinance = async () => {
    try {
      const response = await api.get('/api/finance/current');
      setFinance(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке финансов');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/finance/transactions/all');
      setTransactions(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке транзакций');
    }
  };

  useEffect(() => {
    fetchFinance();
    fetchTransactions();
  }, []);

  const handleUpdateAmount = async () => {
    try {
      await api.put('/api/finance/current', {
        total_amount: parseFloat(newAmount)
      });
      message.success('Сумма успешно обновлена');
      fetchFinance();
      setNewAmount('');
    } catch (error) {
      message.error('Ошибка при обновлении суммы');
    }
  };

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: ru })
    },
    {
      title: 'Сотрудник',
      dataIndex: ['user', 'name'],
      key: 'user_name'
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount} ₽`
    },
    {
      title: 'Причина',
      dataIndex: 'reason',
      key: 'reason'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Финансы на текущую неделю" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <p>Текущая сумма: {finance?.total_amount} ₽</p>
            <p>
              Период: {finance?.week_start && format(new Date(finance.week_start), 'dd.MM.yyyy', { locale: ru })} - 
              {finance?.week_end && format(new Date(finance.week_end), 'dd.MM.yyyy', { locale: ru })}
            </p>
          </div>
          <Input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Новая сумма"
            style={{ width: '200px' }}
          />
          <Button type="primary" onClick={handleUpdateAmount}>
            Обновить сумму
          </Button>
        </div>
      </Card>

      <Card title="Последние транзакции">
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AdminFinance; 