import { TypeOf, object, string, number } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const createPostRequestSchema = object({
  title: string().min(1).max(50),
  content: string().min(1),
})
  .required()
  .strict();

export const getPostQuerySchema = object({
  id: number({
    coerce : true
  }),
  uuid: string().uuid(),
})
  .partial()
  .strict()
  .refine((fields) => Object.keys(fields).length && Object.keys(fields).length === 1, {
    message: 'kindly provide one of post id or uuid ONLY',
    path: ['id', 'uuid'],
  });

export const fetchPostsQuerySchema = object({
  pageSize: number({
    coerce: true,
  }).int(),
  page: number({
    coerce: true,
  }).int(),
  userId : number(
    {
        coerce : true
    }
  ).int()
})
.partial()
.strict();


export const updatePostSchema = createPostRequestSchema.partial().refine((fields) => Object.keys(fields).length >= 1, {
    message: 'kindly provide one or both of post title or post content',
    path: ['post', 'content'],
  });

export type CreatePostRequestType = TypeOf<typeof createPostRequestSchema> & {
  userId: number;
};

export type GetPostQueryType = TypeOf<typeof getPostQuerySchema>;

export type FetchPostsQueryType = TypeOf<typeof fetchPostsQuerySchema>;

export type UpdatePostRequestType = TypeOf<typeof updatePostSchema>


export class CreatePostDto implements TypeOf<typeof createPostRequestSchema>{
  @ApiProperty()
  title! : string
  @ApiProperty()
  content! : string   
}


export class FetchPostsDto implements FetchPostsQueryType{
   @ApiProperty({required : false})
   page! : number
   @ApiProperty({required : false})
   pageSize! : number
   @ApiProperty({required : false})
   userId! : number
}


export class FetchUsersPostsDto implements Omit<FetchPostsQueryType, 'userId'>{

  @ApiProperty({required : false})
  page! : number
  @ApiProperty({required : false})
  pageSize! : number

}


export class GetPostQueryDto implements GetPostQueryDto{

  @ApiProperty({required : false})
  id! : number
  @ApiProperty({required : false})
  uuid! : string

}


export class UpdatePostDto implements UpdatePostRequestType{
  @ApiProperty({required : false})
  title! : string
  @ApiProperty({required : false})
  content! : string 
}
