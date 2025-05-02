import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Worker } from '../../workers/entities/worker.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class CodeTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  count: number;

  @ManyToOne(() => Worker, worker => worker.codeTransactions)
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  @Column()
  workerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'addedById' })
  addedBy: User;

  @Column()
  addedById: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  hour: number;

  @Column()
  date: string; // формат YYYY-MM-DD
} 