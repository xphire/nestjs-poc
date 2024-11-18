import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Post } from './posts.entity';
import {
  CreatePostRequestType,
  GetPostQueryType,
  FetchPostsQueryType,
  UpdatePostRequestType,
} from './posts.dto';

export interface GetManyResults {
  count: number;
  posts: Post[];
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(payload: CreatePostRequestType): Promise<Post | null> {
    const post = new Post();

    post.title = payload.title;
    post.content = payload.content;
    post.userId = payload.userId;

    return this.postRepository.save(post);
  }

  async getOne(query: GetPostQueryType): Promise<Post | null> {
    const { id, uuid } = query;

    if (id) {
      return await this.postRepository.findOne({
        where: {
          id,
        },
      });
    }

    if (uuid) {
      return await this.postRepository.findOne({
        where: {
          uuid,
        },
      });
    }

    throw new BadRequestException('invalid query');
  }

  async getMany(query: FetchPostsQueryType): Promise<GetManyResults | null> {
    const page = query.page || 1;
    const take = query.pageSize ||  5;

    const skip = (page - 1) * take;

    if (query.userId) {
      return {
        count: await this.postRepository.count({
            where : {
                userId : query.userId
            }
        }),
        posts: await this.postRepository.find({
          skip,
          take,
          where: {
            userId: query.userId,
          },
        }),
      };
    }

    return {
      count: await this.postRepository.count(),
      posts: await this.postRepository.find({
        skip,
        take,
      }),
    };
  }

  async update(payload: UpdatePostRequestType & { id: number }): Promise<Post | null> {
    const { id, ...rest } = payload;

    await this.postRepository.update({ id }, rest);

    return this.postRepository.findOneBy({ id });
  }

  async remove(query: { id: number }): Promise<DeleteResult | null> {
    const { id } = query;

    return this.postRepository.delete({ id });
  }
}
