import { object, string, number, z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const createCommentRequestSchema = object({
  content: string().min(1),
  postId: number({ coerce: true }),
})
  .strict()
  .required();

export const getCommentQuerySchema = object({
  id: number({
    coerce: true,
  }).positive(),
  uuid: string().uuid(),
})
  .partial()
  .strict()
  .refine(
    (fields) =>
      Object.keys(fields).length &&
      Object.keys(fields).length === 1 &&
      Object.values(fields).some((field) => field !== undefined),
    {
      message: 'kindly provide one of comment id or uuid ONLY',
      path: ['id', 'uuid'],
    },
  );

export const fetchCommentsQuerySchema = object({
  pageSize: number({coerce : true}).int(),
  page: number({
    coerce: true,
  }).int(),
})
  .partial()
  .strict();

export type CreateCommentType = z.infer<typeof createCommentRequestSchema> & { userId: number };

export type GetCommentQueryType = z.infer<typeof getCommentQuerySchema>;

export type FetchCommentsQueryType = z.infer<typeof fetchCommentsQuerySchema> & { userId: number };


export class CreateCommentDto implements z.infer<typeof createCommentRequestSchema>  {
  @ApiProperty()
  content! : string;  
  @ApiProperty()
  postId! : number;
}


export class FetchCommentQueryDto implements GetCommentQueryType{
  @ApiProperty({required : false})
  id! : number;  
  @ApiProperty({required : false})
  uuid! : string;

}


export class FetchCommentsQueryDto implements Omit<FetchCommentsQueryType, 'userId'>{
  @ApiProperty({required : false})
  pageSize! : number;  
  @ApiProperty({required : false})
  page! : number;

}

