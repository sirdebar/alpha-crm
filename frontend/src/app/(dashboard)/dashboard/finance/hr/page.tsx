"use client";

import { useEffect, useState } from 'react';
import { Card, Input, Button, Form, Modal, message } from 'antd';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FinanceBank, FinanceTransaction } from '@/types';

export default function HRFinancePage() {
  const [bank, setBank] = useState<FinanceBank | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      const [bankData, transactionsData] = await Promise.all([
        api.get('/finance/bank'),
        api.get('/finance/transactions/my')
      ]);
      setBank(bankData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      message.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (values: { amount: number; reason: string }) => {
    try {
      await api.post('/finance/transaction', values);
      message.success('Транзакция успешно создана');
      loadData();
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Ошибка при создании транзакции:', error);
      message.error('Не удалось создать транзакцию');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="p-4">
      <Card title="Банк" className="mb-4">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Текущая сумма в банке:</h3>
            <p className="text-2xl font-bold">{bank?.amount?.toFixed(2) || 0} ₽</p>
          </div>

          <Button type="primary" onClick={() => setModalVisible(true)}>
            Создать транзакцию
          </Button>

          {bank && (
            <div className="mt-4">
              <p>Последнее обновление: {format(new Date(bank.updatedAt), 'dd MMMM yyyy HH:mm', { locale: ru })}</p>
              <p>Начало недели: {format(new Date(bank.weekStart), 'dd MMMM yyyy', { locale: ru })}</p>
              <p>Конец недели: {format(new Date(bank.weekEnd), 'dd MMMM yyyy', { locale: ru })}</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="История транзакций" className="mb-4">
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Сумма: {transaction.amount.toFixed(2)} ₽</p>
                  <p className="text-gray-600">Причина: {transaction.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.createdAt), 'dd MMMM yyyy HH:mm', { locale: ru })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500">Транзакций пока нет</p>
          )}
        </div>
      </Card>

      <Modal
        title="Создать транзакцию"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreateTransaction}
          layout="vertical"
        >
          <Form.Item
            name="amount"
            label="Сумма"
            rules={[
              { required: true, message: 'Введите сумму' },
              { type: 'number', min: 0.01, message: 'Сумма должна быть больше 0' }
            ]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Причина"
            rules={[{ required: true, message: 'Укажите причину' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Создать
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 