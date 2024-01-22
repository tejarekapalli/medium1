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
  
    async login(existingUser: ExistingUserDto): Promise<{ token: string } | null> {
      const { email, password } = existingUser;
      const user = await this.validateUser(email, password);
  
      if (!user) return null;
  
      const jwt = await this.jwtService.signAsync({ user });
      return { token: jwt };
    }

    async createToken(userId: string) {
    const payload = { sub: userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(userId: string): Promise<void> {
    const token = this.jwtService.sign({ sub: userId });
    this.revokedTokens.add(token);
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }
  }
