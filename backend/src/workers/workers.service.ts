import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Worker } from './entities/worker.entity';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker)
    private workersRepository: Repository<Worker>,
    private usersService: UsersService,
  ) {}

  async findAll() {
    return this.workersRepository.find({
      relations: ['curator'],
    });
  }

  async findOne(id: number) {
    return this.workersRepository.findOne({
      where: { id },
      relations: ['curator'],
    });
  }

  async findByUsername(username: string) {
    return this.workersRepository.findOne({
      where: { username },
      relations: ['curator'],
    });
  }

  async create(createWorkerDto: CreateWorkerDto, curatorId: number) {
    const existingWorker = await this.findByUsername(createWorkerDto.username);
    if (existingWorker) {
      throw new ConflictException('Воркер с таким именем уже существует');
    }

    const curator = await this.usersService.findById(curatorId);
    if (!curator) {
      throw new NotFoundException('Куратор не найден');
    }

    const hashedPassword = await bcrypt.hash(createWorkerDto.password, 10);
    const newWorker = this.workersRepository.create({
      ...createWorkerDto,
      password: hashedPassword,
      curator,
    });

    await this.workersRepository.save(newWorker);
    const { password, ...result } = newWorker;
    return result;
  }

  async getWorkerStats() {
    const workers = await this.workersRepository.find({
      relations: ['curator'],
    });

    const stats = workers.map(worker => {
      const createdAt = new Date(worker.createdAt);
      const now = new Date();
      const daysInTeam = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: worker.id,
        username: worker.username,
        tag: worker.tag,
        curatorName: worker.curator.username,
        daysInTeam,
        createdAt: worker.createdAt,
      };
    });

    return stats;
  }
} 