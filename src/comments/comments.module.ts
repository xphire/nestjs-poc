import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import  {PostsModule} from 'src/posts/posts.module'
import { Post } from '../posts/posts.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Comment, Post]), UsersModule, PostsModule],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
