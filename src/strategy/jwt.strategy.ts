// In your authentication strategy file (e.g., jwt.strategy.ts)
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:'secret', // Replace with your actual secret key
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, username: payload.username }; // Adjust based on your payload
  }
}
