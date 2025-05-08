import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    this.createAdminIfNotExists();
  }

  private async createAdminIfNotExists() {
    const adminExists = await this.usersRepository.findOne({
      where: { username: 'admin' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await this.usersRepository.save({
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      console.log('Администратор создан с логином: admin, пароль: admin');
    }
  }

  async findAll(options?: FindManyOptions<User>): Promise<User[]> {
    const defaultOptions: FindManyOptions<User> = {
      relations: ['workers'],
      where: { isActive: true }
    };
    
    if (options?.where) {
      return this.usersRepository.find({ 
        ...defaultOptions, 
        ...options,
        where: options.where
      });
    }
    
    return this.usersRepository.find(options ? { ...defaultOptions, ...options } : defaultOptions);
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { id, isActive: true },
      relations: ['workers']
    });
  }

  async getCurators(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.CURATOR, isActive: true },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOne(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    const user = new User();
    user.username = createUserDto.username;
    user.role = createUserDto.role;

    // Хешируем пароль
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(createUserDto.password, salt);

    return this.usersRepository.save(user);
  }

  async deactivateUser(username: string): Promise<{ message: string }> {
    const user = await this.findOne(username);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.role === UserRole.ADMIN && user.username === 'admin') {
      throw new ConflictException('Нельзя удалить главного администратора');
    }

    user.isActive = false;
    await this.usersRepository.save(user);
    return { message: `Пользователь ${username} деактивирован` };
  }

  async updateUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
} 