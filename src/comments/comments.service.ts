import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Comment } from './comments.entity';
import { Post } from 'src/posts/posts.entity';

import { CreateCommentType, FetchCommentsQueryType, GetCommentQueryType } from './comments.dto';

export interface GetManyResults {
  count: number;
  comments: Comment[];
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  
  ) {}

  async create(payload: CreateCommentType): Promise<Comment | null> {
    const { content, userId, postId } = payload;

    //check that post is valid
    const post = await this.postRepository.findOne({
      where: {
        id : postId
      }
    }) 

    if (!post) throw new BadRequestException('invalid post');

    const comment = new Comment();

    comment.content = content;
    comment.userId = userId;
    comment.postId = postId;

    return this.commentRepository.save(comment);
  }

  async getOne(query: GetCommentQueryType): Promise<Comment | null> {
    const { id, uuid } = query;

    if (id) {
      return await this.commentRepository.findOne({
        where: {
          id,
        },
      });
    }

    if (uuid) {
      return await this.commentRepository.findOne({
        where: {
          uuid,
        },
      });
    }

    throw new BadRequestException('invalid query');
  }

  async getMany(query: FetchCommentsQueryType): Promise<GetManyResults | null> {
    const page = query.page || 1;
    const take = query.pageSize || 5;

    const skip = (page - 1) * take;

    if (query.userId) {
      return {
        count: await this.commentRepository.count({
          where: {
            userId: query.userId,
          },
        }),
        comments: await this.commentRepository.find({
          skip,
          take,
          where: {
            userId: query.userId,
          },
        }),
      };
    }

    throw new BadRequestException('invalid query');
  }

  async remove(query: { id?: number; uuid?: string }): Promise<DeleteResult | null> {
    const { id, uuid } = query;

    const comment = await this.getOne(query);

    if (!comment) throw new NotFoundException('failed to retrieve comment to be deleted');

    if (uuid) return this.commentRepository.delete({ uuid });

    return this.commentRepository.delete({ id });
  }
}
