import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NewUserDto } from 'src/dto/new.user.dto';
import { UserDetails } from 'src/interface/user.interface';
import { ExistingUserDto } from 'src/dto/existing.user.dto';


@Controller('auth')
export class AuthController {
  
    constructor( private authService:AuthService){}
    
    

    @Post('register')
    register(@Body() user:NewUserDto):Promise<UserDetails  | null>{
        return this.authService.register(user)
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() user:ExistingUserDto):Promise<{token:string} | null>{
        return this.authService.login(user)
    }

    @Post('logout')
async logout(@Request() req) {
  if (req.user && req.user.id) {
    const userId = req.user.id;
    this.authService.logout(userId);
    return { message: 'Logout successful' };
  } else {
    console.log('User not authenticated:', req.user);
    return { message: 'User not authenticated' };
  }
}
}
    
