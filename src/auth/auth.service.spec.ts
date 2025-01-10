import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;

  const mockFactory = {
    signAsync: async () => {},
    findOneBy: async () => {},
  };

  const { email, password } = {
    email: 'xpc@aol.com',
    password: 'testpassword',
  };

  const resolvedUser: Omit<User, 'createdAt' | 'updatedAt'> = {
    id: 5,
    uuid: crypto.randomUUID(),
    lastName: 'Ziroll',
    firstName: 'Bob',
    email: 'bob@test.test',
    password: 'testpassword123',
    isAdmin: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockFactory,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('valid sign in', async () => {
    jest.spyOn(argon2, 'verify').mockResolvedValue(true);

    mockFactory.findOneBy = jest.fn().mockResolvedValue(resolvedUser);
    mockFactory.signAsync = jest.fn().mockResolvedValue('abcdefgh');

    expect(await service.signIn(email, password)).toEqual('abcdefgh');
    expect(mockFactory.findOneBy).toHaveBeenCalledWith({ email });
    expect(argon2.verify).toHaveBeenCalledWith(resolvedUser.password, password);
  });

  test('invalid sign in if user is not found', async () => {
    mockFactory.findOneBy = jest.fn().mockResolvedValue(null);
    await expect(service.signIn(email, password)).rejects.toThrow('unauthorized');
    expect(mockFactory.findOneBy).toHaveBeenCalledWith({ email });
  });

  test('invalid sign-in if password does not match database hash as verified by argon2', async () => {
    mockFactory.findOneBy = jest.fn().mockResolvedValue(resolvedUser);
    jest.spyOn(argon2, 'verify').mockResolvedValue(false);
    await expect(service.signIn(email, password)).rejects.toThrow('unauthorized');

    expect(mockFactory.findOneBy).toHaveBeenCalledWith({ email });
    expect(argon2.verify).toHaveBeenCalledWith(resolvedUser.password, password);
  });
});
