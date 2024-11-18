import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  HttpException,
  HttpStatus,
  Get,
  Query,
  BadRequestException,
  Patch,
  NotFoundException,
  UnauthorizedException,
  Delete,
  ForbiddenException,
  HttpCode
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ZodValidationPipe } from 'src/validation-pipe';
import {
  CreatePostDto,
  createPostRequestSchema,
  GetPostQueryDto,
  getPostQuerySchema,
  fetchPostsQuerySchema,
  updatePostSchema,
  UpdatePostDto,
  FetchPostsDto,
  FetchUsersPostsDto
} from './posts.dto';
import { Post as PostEntity } from './posts.entity';
import { UserRequest } from 'src/main';
import { AdminGuard } from 'src/auth/admin.guard';
import { UsersService } from 'src/users/users.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';


interface FetchManyResult {

   posts : PostEntity[],
   meta : {
      page : number,
      perPage : number,
      total : number
   }
}

@Controller('posts')
@ApiBearerAuth()
export class PostsController {
  constructor(
   private postsService: PostsService,
   private usersService : UsersService) {}

  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({description : 'get all posts in paginated form', summary : 'get all posts in paginated form'})
  async getPosts(
    @Query(new ZodValidationPipe(fetchPostsQuerySchema)) query: FetchPostsDto,
  ): Promise<FetchManyResult | null> {
    try {
      const posts = await this.postsService.getMany(query);

      if (!posts?.posts.length) {
         throw new NotFoundException('no posts found');
       }

       return {
         posts: posts.posts,
         meta: {
           page: query.page || 1,
           perPage: query.pageSize || 5,
           total: posts.count,
         },
       };


    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      if (error instanceof NotFoundException) throw error;

      throw new HttpException('failed to retrieve posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('user')
  @ApiOperation({description : "get a user's posts in paginated form", summary : "get a user's posts in paginated form"})
  async getUserPosts(
    @Query(new ZodValidationPipe(fetchPostsQuerySchema)) query: FetchUsersPostsDto,
    @Request() request: UserRequest,
  ): Promise<FetchManyResult | null> {
    try {

      const posts = await this.postsService.getMany({
         ...query,
         userId: request.user.sub,
       });

      if (!posts?.posts.length) {
         throw new NotFoundException('no posts found');
       }

       return {
         posts: posts.posts,
         meta: {
           page: query.page || 1,
           perPage: query.pageSize || 5,
           total: posts.count,
         },
       };


    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      if (error instanceof NotFoundException) throw error;

      throw new HttpException('failed to retrieve posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('post')
  @ApiOperation({description : 'create a post by supplying content and title of post', summary : 'create a post by supplying content and title of post'})
  async createPost(
    @Body(new ZodValidationPipe(createPostRequestSchema)) payload: CreatePostDto,
    @Request() request: UserRequest,
  ): Promise<PostEntity | null> {
    try {
      return await this.postsService.create({
        ...payload,
        userId: request.user.sub,
      });
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      throw new HttpException('failed to create post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('post')
  @ApiOperation({description : 'get a post by supplying the id or uuid', summary : 'get a post by supplying the id or uuid'})
  async getPost(
    @Query(new ZodValidationPipe(getPostQuerySchema)) query: GetPostQueryDto,
  ): Promise<PostEntity | null> {
    try {
      return this.postsService.getOne(query);
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      throw new HttpException('failed to get post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('post')
  @ApiOperation({description : 'update title,content of post by supplying one of id or uuid', summary : 'update title,content of post by supplying one of id or uuid'})
  @HttpCode(200)
  async updatePost(
    @Body(new ZodValidationPipe(updatePostSchema)) payload: UpdatePostDto,
    @Query(new ZodValidationPipe(getPostQuerySchema)) query: { id: number },
    @Request() request: UserRequest,
  ): Promise<PostEntity | null> {
    try {
      //fetch post

      const post: PostEntity | null = await this.postsService.getOne(query);

      if (!post) throw new NotFoundException('cannot update post');

      if (post.userId !== request.user.sub) throw new ForbiddenException('cannot update post');

      return this.postsService.update({
        id: query.id,
        ...payload,
      });
    } catch (error) {
      console.log(error);

      if (error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof ForbiddenException) throw error;

      throw new HttpException('failed to update post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @UseGuards(AuthGuard)
  @Delete('post')
  @HttpCode(204)
  @ApiOperation({description : 'delete a post by supplying the id or uuid', summary : 'delete a post by supplying the id or uuid'})
  async deletePost(
    @Query(new ZodValidationPipe(getPostQuerySchema)) query : GetPostQueryDto,
    @Request() request: UserRequest
  )
  {

   try {

      const userId = request.user.sub

      const post = await this.postsService.getOne(query)

      if (!post) throw new NotFoundException('failed to delete post')

      const postUserId = post.userId

      const postUserFetch = await this.usersService.getOne({id : userId})
      
      if (!postUserFetch || userId !== postUserId || !postUserFetch.isAdmin) throw new ForbiddenException('cannot delete post')

      await this.postsService.remove({id : query.id as number})

      return

   } catch (error) {

      console.log(error);

      if (error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof ForbiddenException) throw error;

      throw new HttpException('failed to delete post', HttpStatus.INTERNAL_SERVER_ERROR);
      
   }


     

   
  }
}
