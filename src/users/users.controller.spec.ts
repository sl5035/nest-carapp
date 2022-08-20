import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'Test@test.net',
          password: 'Test',
        } as User);
      },
      findByEmail: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'Test' } as User]);
      },
      //   remove: () => {},
      //   update: () => {},
    };
    fakeAuthService = {
      //   signUp: () => {},
      signIn: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('Test@test.net');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('Test@test.net');
  });

  it('findUser returns a user with the given id', async () => {
    const user = await controller.findUser('1');

    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with the given id is not found', async () => {
    expect.assertions(1);

    fakeUsersService.findOne = () => null;

    try {
      await controller.findUser('1');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
    }
  });

  it('signIn updates session object and returns user', async () => {
    const session = { userId: -1 };
    const user = await controller.signIn(
      { email: 'Test@test', password: 'Test' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
