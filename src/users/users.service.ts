import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from './users.entity';
import {
  CreateUserRequestType,
  FetchUserQueryType,
  FetchUsersQueryType,
  PartialUpdateRequestType,
} from './users.dto';
import * as argon2 from 'argon2';

interface GetManyResults {
  count: number;
  users: User[];
}

const selectOptions = {
  id: true,
  uuid: true,
  email: true,
  isAdmin: true,
  firstName: true,
  lastName: true,
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(payload: CreateUserRequestType): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: payload.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('user already exists');
    }

    const user = new User();

    user.email = payload.email;
    user.password = await argon2.hash(payload.password);

    if (payload.isAdmin) {
      user.isAdmin = payload.isAdmin;
    }

    user.firstName = payload.firstName;
    user.lastName = payload.lastName;

    return this.usersRepository.save(user);
  }

  async getOne(query: FetchUserQueryType): Promise<User | null> {
    const { email, id, uuid } = query;

    if (email) {
      return this.usersRepository.findOne({
        where: {
          email,
        },
        select: selectOptions,
      });
    }

    if (id) {
      return this.usersRepository.findOne({
        where: {
          id,
        },
        select: selectOptions,
      });
    }

    if (uuid) {
      return this.usersRepository.findOne({
        where: {
          uuid,
        },
        select: selectOptions,
      });
    }

    throw new BadRequestException('invalid query');
  }

  async getMany(query: FetchUsersQueryType): Promise<GetManyResults | null> {
    const page = query.page || 1;
    const take = query.pageSize || parseInt('5');

    const skip = (page - 1) * take;

    return {
      count: await this.usersRepository.count(),
      users: await this.usersRepository.find({
        skip,
        take,
        select: selectOptions,
      }),
    };
  }

  async update(
    payload: PartialUpdateRequestType & { id?: number; uuid?: string },
  ): Promise<User | null> {
    const { id, uuid, ...rest } = payload;

    if (uuid) {
      await this.usersRepository.update({ uuid }, rest);

      return this.usersRepository.findOneBy({ id });
    }

    if (id) {
      await this.usersRepository.update({ id }, rest);

      return this.usersRepository.findOneBy({ id });
    }

    throw new BadRequestException('kindly supply one of ID or UUID only as a query Param');
  }

  async remove(payload: { id: number }): Promise<DeleteResult | null> {
    const { id } = payload;

    return this.usersRepository.delete({ id });
  }
}
