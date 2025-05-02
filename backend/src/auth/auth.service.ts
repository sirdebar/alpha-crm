import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user || !user.isActive) {
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('Учетная запись деактивирована');
      }
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }
    
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        profile: {
          avatarUrl: user.avatarUrl,
          contactLinks: user.contactLinks || [],
        }
      },
    };
  }
  
  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    
    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password
    );
    
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Текущий пароль неверен');
    }
    
    // Хешируем новый пароль
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, salt);
    
    // Обновляем пароль
    user.password = hashedPassword;
    await this.usersService.updateUser(user);
    
    return { message: 'Пароль успешно изменен' };
  }
} 