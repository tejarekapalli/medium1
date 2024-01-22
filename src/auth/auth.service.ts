import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

import { ExistingUserDto } from 'src/dto/existing.user.dto';
import { NewUserDto } from 'src/dto/new.user.dto';
import { UserDetails } from 'src/interface/user.interface';

import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private readonly revokedTokens: Set<string> = new Set();
    constructor(private userService: UserService, private jwtService: JwtService) {}
  
    async hashPassword(password: string): Promise<string> {
      const saltRounds = 10;
  
      return bcrypt.hash(password, saltRounds);
    }
  
    async register(user: Readonly<NewUserDto>): Promise<UserDetails | null> {
      const { name, email, password } = user;
      const existingUser = await this.userService.findByEmail(email);
  
      if (existingUser) throw new HttpException('User exists', HttpStatus.CONFLICT); // Email taken
  
      const hashedPassword = await this.hashPassword(password);
      const newUser = await this.userService.create(name, email, hashedPassword);
      return this.userService._getUserDetails(newUser);
    }
  
    async doesPasswordMatch(password: string, hashedPassword: string): Promise<boolean> {
        // Ensure both password and hashedPassword are non-null and non-undefined
        if (!password || !hashedPassword) {
          throw new Error('Password and hashedPassword are required for comparison.');
        }  
        return bcrypt.compare(password, hashedPassword);
      }
  
      async validateUser(email: string, password: string): Promise<UserDetails | null> {
        const user = await this.userService.findByEmail(email);
        
        const doesUserExist = !!user;
      
        if (!doesUserExist) return null;
      
        if (password && user.password) {
          
      
          const doesPasswordMatch = await this.doesPasswordMatch(password, user.password);
      
          if (!doesPasswordMatch) return null;
      
          return this.userService._getUserDetails(user);
        } else {
          
          throw new Error('Password and user.password are required for validation.');
        }
      }
  
      async login(existingUser: ExistingUserDto): Promise<{ accessToken: string; refreshToken: string } | null> {
        const { email, password } = existingUser;
        const user = await this.validateUser(email, password);
      
        if (!user) return null;
      
        const tokens = await this.createTokens(user.id); // Assuming user.id is the user's identifier
      
        return tokens;
      }
    async createTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
      const accessTokenPayload = { sub: userId };
      const refreshTokenPayload = { sub: userId, type: 'refresh' };
  
      const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '3600s' }); // Adjust the expiration as needed
      const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: '7d' }); // Adjust the expiration as needed
  
      return { accessToken, refreshToken };
    }
  
    async logout(userId: string): Promise<void> {
      // Invalidate both access and refresh tokens
      const accessToken = this.jwtService.sign({ sub: userId });
      const refreshToken = this.jwtService.sign({ sub: userId, type: 'refresh' });
  
      this.revokedTokens.add(accessToken);
      this.revokedTokens.add(refreshToken);
    }
  
    isTokenRevoked(token: string): boolean {
      return this.revokedTokens.has(token);
    }
  }
  
