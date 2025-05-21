import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtConfigs } from 'src/configs/types';
import { TypeRole } from 'src/entities/utilisateur.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtConfigs = configService.get<JwtConfigs>('jwt');
    if (!jwtConfigs) {
      throw new Error('JWT configuration is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfigs.secret,
    });
  }

  validate(payload: { sub: string; email: string; role: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: TypeRole[payload.role as keyof typeof TypeRole],
    };
  }
}
