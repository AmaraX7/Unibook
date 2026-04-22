import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
constructor(
  private readonly usersService: UsersService,
  private readonly jwtService: JwtService,
) {}  

async register(dto: RegisterDto) {
  const existing = await this.usersService.findByEmail(dto.email);
  if (existing) throw new ConflictException('Email already in use');
  
  const user = await this.usersService.createUser(dto);
  return { access_token: this.jwtService.sign({ email: user.email, sub: user.id }) };
}


async login(dto: LoginDto) {
  const user = await this.usersService.findByEmail(dto.email);  
    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
    }   

    return { access_token: this.jwtService.sign({ email: user.email, sub: user.id, role: user.role }) };
 }

}
