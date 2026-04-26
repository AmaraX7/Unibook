import {
  Injectable,
  ConflictException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PersonsService } from '../persons/persons.service'; // ← nombre correcto
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt-payload.interface';
import { CreatePersonDto } from '../persons/dto/create-person.dto';
import { PersonRole } from '../persons/entities/person.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly personsService: PersonsService, // ← cambiado
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateTokens(person: { id: number; email: string; role: PersonRole; companyId: number | null }) {
    const payload: JwtPayload = {
      sub: person.id,
      email: person.email,
      role: person.role,
      companyId: person.companyId,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    };
  }

  async refreshTokens(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const person = await this.personsService.findByEmail(payload.email); // ← cambiado
      if (!person) throw new UnauthorizedException('Invalid refresh token');
      return this.generateTokens(person);
    } catch (error) {
      this.logger.warn(
        `Refresh token failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(dto: CreatePersonDto) {
    this.logger.log(`Register attempt email=${dto.email}`);
    const existing = await this.personsService.findByEmail(dto.email); // ← cambiado
    if (existing) throw new ConflictException('Email already in use');

    const person = await this.personsService.createPerson(dto); // ← cambiado
    this.logger.log(`Register success personId=${person.id}`);
    return this.generateTokens(person);
  }

  async login(dto: LoginDto) {
    this.logger.log(`Login attempt email=${dto.email}`);
    const person = await this.personsService.findByEmailWithPassword(dto.email); // ← cambiado
    if (!person) {
      this.logger.warn(`Login failed (email not found) email=${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, person.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed (bad password) email=${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`Login success personId=${person.id}`);
    return this.generateTokens(person);
  }
}