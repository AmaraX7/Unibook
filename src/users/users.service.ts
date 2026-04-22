import { Injectable } from '@nestjs/common';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateRoleDto } from './dto/update-role.dto';


@Injectable()
export class UsersService { 

  constructor(
  @InjectRepository(User)
  private readonly usersRepository: Repository<User>
) {}

  async findByEmail(email: string): Promise<User | null> {
  return this.usersRepository.findOne({ where: { email } });
}

  async createUser(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({ ...dto, password: hashedPassword });
    return this.usersRepository.save(user);
  }

async deleteById(id: number): Promise<void> {
  const user = await this.usersRepository.findOne({ where: { id } });
  if (!user) throw new NotFoundException(`User #${id} not found`);
  await this.usersRepository.delete(id);
} 

  async updateRole(id: number, dto: UpdateRoleDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }


  
}
