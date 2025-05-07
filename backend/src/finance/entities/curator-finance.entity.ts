import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class CuratorFinance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'curatorId' })
  curator: User;

  @Column()
  curatorId: number;

  @Column({ type: 'float', default: 0 })
  profit: number;

  @Column({ type: 'float', default: 0 })
  expenses: number;

  @Column({ type: 'date' })
  month: string; // Формат YYYY-MM-DD, где DD всегда 01 (первый день месяца)

  @Column({ default: false })
  locked: boolean; // Флаг, показывающий, заблокированы ли данные для редактирования

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 