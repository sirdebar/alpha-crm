import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.workers)
  curator: User;
} 