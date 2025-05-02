import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'username', 'role', 'isActive', 'createdAt'],
      relations: ['workers'],
    });
  }

  async findOne(username: string) {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['workers'],
    });
  }

  async findById(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['workers'],
    });
  }

  async getCurators() {
    return this.usersRepository.find({
      where: { role: UserRole.CURATOR, isActive: true },
      relations: ['workers'],
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findOne(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.usersRepository.save(newUser);
    const { password, ...result } = newUser;
    return result;
  }

  async deactivateUser(username: string) {
    const user = await this.findOne(username);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.role === UserRole.ADMIN && user.username === 'admin') {
      throw new ConflictException('Нельзя удалить главного администратора');
    }

    await this.usersRepository.update(user.id, { isActive: false });
    return { message: `Пользователь ${username} деактивирован` };
  }
} 