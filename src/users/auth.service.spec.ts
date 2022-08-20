import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];

    fakeUsersService = {
      findByEmail: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);

        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signUp('Test@google.com', 'asdf');

    expect(user.password).not.toEqual('asdf');

    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with an email that is in use', async () => {
    await service.signUp('Test2@google.com', 'asdf');

    try {
      await expect(service.signUp('Test2@google.com', 'Test')).rejects.toThrow(
        BadRequestException,
      );
    } catch (err) {}
  });

  it('throws if signIn is called with an unused email', async () => {
    try {
      await expect(service.signIn('Test3@google.com', 'asdf')).rejects.toThrow(
        NotFoundException,
      );
    } catch (error) {}
  });

  it('throws if an invalid password is provided', async () => {
    await service.signUp('Test4@google.com', 'asdf');

    let user: User;

    try {
      user = await service.signIn('Test4@google.com', 'asdf2');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
    }
    expect(user).not.toBeDefined();
  });

  it('returns a user if correct password is provided', async () => {
    await service.signUp('Any@any.net', 'Test');
    const user = await service.signIn('Any@any.net', 'Test');

    expect(user).toBeDefined();
  });
});
