
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './posts.entity';
import {CreatePostRequestType } from './dto/posts.dto';

@Injectable()
export class PostsService {

    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>
    ){}


    async create(payload: CreatePostRequestType) : Promise<Post | null>
    {
         const post = new Post()

         post.title = payload.title
         post.content = payload.content
         post.user = payload.userId

         return this.postRepository.save(post)
    }
}


