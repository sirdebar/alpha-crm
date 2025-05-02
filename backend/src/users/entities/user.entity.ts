import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Worker } from '../../workers/entities/worker.entity';

export enum UserRole {
  ADMIN = 'admin',
  CURATOR = 'curator',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'text',
    default: UserRole.CURATOR,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
  
  @Column({ nullable: true })
  avatarUrl: string;
  
  @Column('simple-array', { nullable: true })
  contactLinks: string[];

  @OneToMany(() => Worker, worker => worker.curator)
  workers: Worker[];
} 