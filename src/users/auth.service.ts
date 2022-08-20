import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(email: string, password: string): Promise<User> {
    // See if email is in use
    const users = await this.usersService.findByEmail(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    // Hash the user password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    return this.usersService.create(email, result);
  }

  async signIn(email: string, password: string): Promise<User> {
    const [user] = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email: ${email} not found`);
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('bad password');
    }

    return user;
  }
}
