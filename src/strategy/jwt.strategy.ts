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
    if (payload.type && payload.type === 'refresh') {
      // Handle refresh token validation differently, if needed
      // You may want to check additional claims or blacklist old refresh tokens
      return { id: payload.sub, type: 'refresh' };
    }

    return { id: payload.sub, type: 'access' }; // Adjust based on your payload
  }
}
