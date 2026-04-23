import { Injectable, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
private readonly logger = new Logger(AuthService.name);

constructor(
  private readonly usersService: UsersService,
  private readonly jwtService: JwtService,
) {}  

async register(dto: RegisterDto) {
  this.logger.log(`Register attempt email=${dto.email}`);
  const existing = await this.usersService.findByEmail(dto.email);
  if (existing) throw new ConflictException('Email already in use');
  
  const user = await this.usersService.createUser(dto);
  this.logger.log(`Register success userId=${user.id}`);
  return { access_token: this.jwtService.sign({ email: user.email, sub: user.id }) };
}


async login(dto: LoginDto) {
  this.logger.log(`Login attempt email=${dto.email}`);
  const user = await this.usersService.findByEmailWithPassword(dto.email);  
    if (!user) {
        this.logger.warn(`Login failed (email not found) email=${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
        this.logger.warn(`Login failed (bad password) email=${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
    }   

    this.logger.log(`Login success userId=${user.id}`);
    return { access_token: this.jwtService.sign({ email: user.email, sub: user.id, role: user.role }) };
 }

}
