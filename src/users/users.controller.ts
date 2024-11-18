import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
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
  updateUserQuerySchema,
  createUserRequestSchema,
  fetchUserQuerySchema,
  fetchUsersQuerySchema,
  partialUpdateUserRequestSchema,
  fullUpdateUserRequestSchema,
  updateCurrentUserSchema,
  FetchUsersQueryDto,
  CreateUserDto,
  FetchUserQueryDto,
  PartialUpdateUserDto,
  UpdateUserQueryDto,
  FullUpdateUserDto,
  UpdateCurrentUserDto
} from './users.dto';
import { ZodValidationPipe } from '../validation-pipe';
import { UserSerializer, UsersSerializer } from './users.serializer';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';
import { UserRequest } from 'src/main';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';



@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AdminGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UsersSerializer })
  @Get()
  @ApiOperation({description : 'get all users in paginated form', summary : 'get all users in paginated form'})
  async getManyUsers(
    @Query(new ZodValidationPipe(fetchUsersQuerySchema)) query: FetchUsersQueryDto,
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
          perPage: query.pageSize || parseInt('5'),
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
  @ApiOperation({description : 'create user', summary : 'create user'})
  async createUser(@Body(new ZodValidationPipe(createUserRequestSchema)) createUserDto: CreateUserDto): Promise<UserSerializer | null> {
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
  @ApiOperation({description : 'fetch user using id,uuid or email', summary : 'fetch user using id,uuid or email'})
  async getOneUser(
    @Query(new ZodValidationPipe(fetchUserQuerySchema)) query: FetchUserQueryDto,
  ): Promise<UserSerializer | null> {
    const { id, email, uuid } = query;

    try {
      const user = await this.usersService.getOne({ id, email, uuid });

      if (!user) throw new NotFoundException('user not found');

      return user;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException('failed to get user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AdminGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UserSerializer })
  @Patch('user')
  @ApiOperation({description : 'partially update user', summary : 'partially update user'})
  async partialUpdateUser(
    @Query(new ZodValidationPipe(updateUserQuerySchema)) fetchUserQueryDto: UpdateUserQueryDto,
    @Body(new ZodValidationPipe(partialUpdateUserRequestSchema)) partialUpdateUserDto: PartialUpdateUserDto,
   ) {
    try {
      const user = await this.usersService.update({
        ...partialUpdateUserDto,
        ...fetchUserQueryDto
      });

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
  @ApiOperation({description : 'fully update user', summary : 'fully update user'})
  async fullUpdateUser(
    @Query(new ZodValidationPipe(updateUserQuerySchema)) fetchUserQueryDto: UpdateUserQueryDto,
    @Body(new ZodValidationPipe(fullUpdateUserRequestSchema)) fullUpdateUserDto: FullUpdateUserDto) {
    try {
      const user = await this.usersService.update(fullUpdateUserDto);

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
  @ApiOperation({description : 'get current authenticated user', summary : 'get current authenticated user'})
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
  @ApiOperation({description : 'partially update current authenticated user', summary : 'partially update current authenticated user'})
  async updateCurrentUser(
    @Request() request: UserRequest,
    @Body(new ZodValidationPipe(updateCurrentUserSchema)) payload: UpdateCurrentUserDto) {
    try {
      return this.usersService.update({
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
