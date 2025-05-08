import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Table, Form, Modal, message } from 'antd';
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
  created_at: string;
}

const HRFinance: React.FC = () => {
  const [finance, setFinance] = useState<Finance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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
      const response = await api.get('/api/finance/transactions/my');
      setTransactions(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке транзакций');
    }
  };

  useEffect(() => {
    fetchFinance();
    fetchTransactions();
  }, []);

  const handleWithdraw = async (values: { amount: number; reason: string }) => {
    try {
      await api.post('/api/finance/transaction', values);
      message.success('Средства успешно сняты');
      setIsModalVisible(false);
      form.resetFields();
      fetchFinance();
      fetchTransactions();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Ошибка при снятии средств');
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
            <p>Доступная сумма: {finance?.total_amount} ₽</p>
            <p>
              Период: {finance?.week_start && format(new Date(finance.week_start), 'dd.MM.yyyy', { locale: ru })} - 
              {finance?.week_end && format(new Date(finance.week_end), 'dd.MM.yyyy', { locale: ru })}
            </p>
          </div>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Снять средства
          </Button>
        </div>
      </Card>

      <Card title="Мои последние транзакции">
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title="Снятие средств"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleWithdraw}>
          <Form.Item
            name="amount"
            label="Сумма"
            rules={[
              { required: true, message: 'Введите сумму' },
              { type: 'number', min: 0, message: 'Сумма должна быть положительной' }
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Причина"
            rules={[{ required: true, message: 'Укажите причину' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Снять
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HRFinance; 