import { Controller, UseGuards, Post, Body, Request, HttpException, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ZodValidationPipe } from 'src/validation-pipe';
import { CreatePostRequestType as CreatePostDto, createPostRequestSchema } from './dto/posts.dto';
import { Post as PostEntity } from './posts.entity';
import { UserRequest } from 'src/main';

@Controller('posts')
export class PostsController {

   constructor( private postsService : PostsService){}


   @UseGuards(AuthGuard)
   @Post('post')
   async createPost(

      @Body(new ZodValidationPipe(createPostRequestSchema)) payload : Omit<CreatePostDto, 'userId'>,
      @Request() request: UserRequest
      
   ) : Promise<PostEntity | null>
   {

      try {

        return await this.postsService.create({
            ...payload,
            userId : request.user.sub
        })
        
      } catch (error) {

         console.log(error)

         throw new HttpException('failed to create post', HttpStatus.INTERNAL_SERVER_ERROR);

      }

   }



}
