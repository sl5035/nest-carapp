import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  create(email: string, password: string): Promise<User> {
    const user = this.userRepository.create({ email, password });

    return this.userRepository.save(user);
  }

  findOne(id: number): Promise<User> {
    if (!id) {
      return null;
    }

    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User[]> {
    return this.userRepository.findBy({ email });
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }

    Object.assign(user, attrs);

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }

    return this.userRepository.remove(user);
  }
}
