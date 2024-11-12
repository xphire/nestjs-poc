import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  BadRequestException,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Query,
  NotFoundException,
  Patch,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserRequestType as CreateUserDto,
  createUserRequestSchema,
  fetchUserQuerySchema,
  FetchUserQueryType as FetchUserDto,
  fetchUsersQuerySchema,
  FetchUsersQueryType as FetchUsersDto,
  PartialUpdateRequestType,
  FullUpdateRequestType,
  partialUpdateUserRequestSchema,
  fullUpdateUserRequestSchema,
  updateCurrentUserSchema,
  UpdateCurrentUserType,
} from './dto/users.dto';
import { ZodValidationPipe } from '../validation-pipe';
import { UserSerializer, UsersSerializer } from './serialization/users.serializer';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';
import { UserRequest } from 'src/main';



@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AdminGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UsersSerializer })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchUsersQuerySchema))
  async getManyUsers(
    @Query(new ZodValidationPipe(fetchUsersQuerySchema)) query: FetchUsersDto,
  ): Promise<UsersSerializer | null> {
    try {
      const result = await this.usersService.getMany(query);

      if (!result?.users.length) {
        throw new NotFoundException('no users found');
      }

      return {
        users: result.users,
        meta: {
          page: query.page || 1,
          perPage: parseInt(query.pageSize || '5'),
          total: result.count,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException('failed to get users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UserSerializer })
  @Post('user')
  @UsePipes(new ZodValidationPipe(createUserRequestSchema))
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserSerializer | null> {
    try {
      const user = await this.usersService.create(createUserDto);

      return user;
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException('failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UserSerializer })
  @Get('user')
  async getOneUser(
    @Query(new ZodValidationPipe(fetchUserQuerySchema)) query: FetchUserDto,
  ): Promise<UserSerializer | null> {
    const { id, email, uuid } = query;

    try {
      const user = await this.usersService.getOne({ id, email, uuid });

      if (!user) throw new BadRequestException('user not found');

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException('failed to get user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AdminGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UserSerializer })
  @Patch('user')
  @UsePipes(new ZodValidationPipe(partialUpdateUserRequestSchema))
  async partialUpdateUser(@Body() partialUpdateUserDto: PartialUpdateRequestType) {
    try {
      const user = await this.usersService.partialUpdate(partialUpdateUserDto);

      return user;
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException('failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AdminGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UserSerializer })
  @Put('user')
  @UsePipes(new ZodValidationPipe(fullUpdateUserRequestSchema))
  async fullUpdateUser(@Body() fullUpdateUserDto: FullUpdateRequestType) {
    try {
      const user = await this.usersService.fullUpdate(fullUpdateUserDto);

      return user;
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException('failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UserSerializer })
  @Get('current')
  async getCurrentUser(@Request() request: UserRequest) {
    try {
      return await this.usersService.getOne({ id: request.user.sub });
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException('failed to get user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UserSerializer })
  @Patch('current')
  @UsePipes(new ZodValidationPipe(updateCurrentUserSchema))
  async updateCurrentUser(@Request() request: UserRequest, @Body() payload: UpdateCurrentUserType) {
    try {
      return this.usersService.partialUpdate({
        id: request.user.sub,
        ...payload,
      });
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException('failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
