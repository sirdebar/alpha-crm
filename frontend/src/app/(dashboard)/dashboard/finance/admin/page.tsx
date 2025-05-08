"use client";

import { useEffect, useState } from 'react';
import { Card, Input, Button, Table, message } from 'antd';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FinanceBank } from '@/types';

export default function AdminFinancePage() {
  const [bank, setBank] = useState<FinanceBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<string>('');

  const loadBank = async () => {
    try {
      const response = await api.get('/finance/bank');
      setBank(response);
    } catch (error) {
      console.error('Ошибка при загрузке банка:', error);
      message.error('Не удалось загрузить данные банка');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBank = async () => {
    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        message.error('Введите корректную сумму');
        return;
      }

      await api.patch('/finance/bank', { amount: numAmount });
      message.success('Банк успешно обновлен');
      loadBank();
      setAmount('');
    } catch (error) {
      console.error('Ошибка при обновлении банка:', error);
      message.error('Не удалось обновить банк');
    }
  };

  useEffect(() => {
    loadBank();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="p-4">
      <Card title="Управление банком" className="mb-4">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Текущая сумма в банке:</h3>
            <p className="text-2xl font-bold">{bank?.amount?.toFixed(2) || 0} ₽</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Обновить сумму:</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Введите новую сумму"
                className="max-w-xs"
              />
              <Button type="primary" onClick={handleUpdateBank}>
                Обновить
              </Button>
            </div>
          </div>

          {bank && (
            <div className="mt-4">
              <p>Последнее обновление: {format(new Date(bank.updatedAt), 'dd MMMM yyyy HH:mm', { locale: ru })}</p>
              <p>Начало недели: {format(new Date(bank.weekStart), 'dd MMMM yyyy', { locale: ru })}</p>
              <p>Конец недели: {format(new Date(bank.weekEnd), 'dd MMMM yyyy', { locale: ru })}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 