import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from 'src/guards/jwt.guards';
import { JwtStrategy } from 'src/strategy/jwt.strategy';

@Module({
  imports:[UserModule,JwtModule.registerAsync({useFactory:()=>({
    secret:'secret',
    signOptions:{expiresIn:'3600s'}
  })})],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard,JwtStrategy]
})
export class AuthModule {}



