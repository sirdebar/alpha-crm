import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Like } from 'typeorm';

@Injectable()
export class SearchService {
  constructor(private usersService: UsersService) {}

  async searchUsers(query: string) {
    if (!query || query.trim().length < 2) {
      return { users: [] };
    }

    const users = await this.usersService.findAll({
      where: [
        { username: Like(`%${query}%`) },
      ],
      take: 10, // Ограничиваем количество результатов
    });

    // Преобразуем результаты, чтобы они соответствовали ожидаемому формату
    return {
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        profile: {
          avatarUrl: user.avatarUrl,
          contactLinks: user.contactLinks || [],
        },
      })),
    };
  }
} 