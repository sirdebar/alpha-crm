import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // В реальном проекте использовать .env!
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.username);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }
} 