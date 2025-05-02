import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfileService {
  constructor(private usersService: UsersService) {}

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      avatarUrl: user.avatarUrl,
      contactLinks: user.contactLinks || [],
    };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Обновляем только поля, которые предоставлены в DTO
    if (updateProfileDto.contactLinks !== undefined) {
      user.contactLinks = updateProfileDto.contactLinks;
    }

    await this.usersService.updateUser(user);

    return {
      avatarUrl: user.avatarUrl,
      contactLinks: user.contactLinks || [],
    };
  }

  async uploadAvatar(userId: number, file: any) {
    try {
      if (!file || !file.filename) {
        throw new BadRequestException('Некорректный файл');
      }
      
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      // Удаляем старую аватарку, если она существует
      if (user.avatarUrl) {
        try {
          const oldPath = user.avatarUrl.replace('/uploads/', '');
          const fullPath = path.join(process.cwd(), 'uploads', oldPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (error) {
          console.error('Ошибка при удалении старой аватарки:', error);
        }
      }

      // Относительный путь для сохранения в БД
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      user.avatarUrl = avatarUrl;

      await this.usersService.updateUser(user);

      return { avatarUrl };
    } catch (error) {
      console.error('Ошибка при загрузке аватарки:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при загрузке аватарки. Попробуйте снова.');
    }
  }
} 