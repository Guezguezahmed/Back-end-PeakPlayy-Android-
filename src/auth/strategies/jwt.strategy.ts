import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Utilisation de '!' pour garantir que la valeur est de type 'string'
      secretOrKey: configService.get<string>('jwt.secret')!, 
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.userId, 
      email: payload.email, 
      role: payload.role 
    };
  }
}