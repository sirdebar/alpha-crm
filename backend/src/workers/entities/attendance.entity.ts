import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Worker } from './worker.entity';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Worker, worker => worker.attendanceRecords)
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  @Column()
  workerId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ default: true })
  present: boolean;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 