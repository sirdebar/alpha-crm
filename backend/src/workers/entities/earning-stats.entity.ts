import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Worker } from './worker.entity';

@Entity()
export class EarningStats {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Worker, worker => worker.earningStats)
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  @Column()
  workerId: number;

  @Column({ type: 'float', default: 0 })
  dailyEarnings: number;

  @Column({ type: 'float', default: 0 })
  weeklyEarnings: number;

  @Column({ type: 'float', default: 0 })
  monthlyEarnings: number;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 