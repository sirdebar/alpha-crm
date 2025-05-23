import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CodeTransaction } from '../../code-stats/entities/code-transaction.entity';
import { Attendance } from './attendance.entity';
import { EarningStats } from './earning-stats.entity';

@Entity()
export class Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
  
  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, user => user.workers)
  @JoinColumn({ name: 'curatorId' })
  curator: User;

  @Column()
  curatorId: number;

  @OneToMany(() => CodeTransaction, transaction => transaction.worker)
  codeTransactions: CodeTransaction[];

  @OneToMany(() => Attendance, attendance => attendance.worker)
  attendanceRecords: Attendance[];

  @OneToMany(() => EarningStats, earningStats => earningStats.worker)
  earningStats: EarningStats[];

  @Column({ type: 'float', default: 0 })
  income: number;

  @Column({ default: 0 })
  todayCodesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 