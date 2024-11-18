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
  NotFoundException,
  UnauthorizedException,
  Delete,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';

import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { ZodValidationPipe } from 'src/validation-pipe';
import {
  createCommentRequestSchema,
  FetchCommentsQueryDto,
  FetchCommentQueryDto,
  fetchCommentsQuerySchema,
  getCommentQuerySchema,
  CreateCommentDto
} from './comments.dto';
import { AdminGuard } from 'src/auth/admin.guard';
import { UserRequest } from 'src/main';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

interface FetchManyResult {
  comments: Comment[];
  meta: {
    page: number;
    perPage: number;
    total: number;
  };
}


@Controller('comments')
@ApiBearerAuth()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({description : "get all of a users comments in paginated form", summary : "get all of a users comments in paginated form"})
  async getComments(
    @Query(new ZodValidationPipe(fetchCommentsQuerySchema)) query: FetchCommentsQueryDto,
    @Request() request: UserRequest,
  ): Promise<FetchManyResult | null> {
    try {
      const comments = await this.commentsService.getMany({
        ...query,
        userId: request.user.sub,
      });

      if (!comments?.comments.length) {
        throw new NotFoundException('no comments found');
      }

      return {
        comments: comments.comments,
        meta: {
          page: query.page || 1,
          perPage: query.pageSize || 5,
          total: comments.count,
        },
      };
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      if (error instanceof NotFoundException) throw error;

      throw new HttpException('failed to retrieve comments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('comment')
  @ApiOperation({description : 'create a comment by supplying content and postId', summary : 'create a comment by supplying content and postId'})
  async createComment(
    @Body(new ZodValidationPipe(createCommentRequestSchema))
    payload: CreateCommentDto,
    @Request() request: UserRequest,
  ): Promise<Comment | null> {
    try {
      return await this.commentsService.create({
        ...payload,
        userId: request.user.sub,
      });
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      throw new HttpException('failed to create comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AdminGuard)
  @Delete('comment')
  @HttpCode(204)
  @ApiOperation({description : 'delete a comment by supplying the id or uuid', summary : 'delete a comment by supplying the id or uuid'})
  async deleteComment(@Query(new ZodValidationPipe(getCommentQuerySchema)) query: FetchCommentQueryDto) {
    try {
      await this.commentsService.remove(query);

      return;
    } catch (error) {
      console.log(error);

      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      )
        throw error;

      throw new HttpException('failed to delete comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
