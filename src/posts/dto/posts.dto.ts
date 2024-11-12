import { TypeOf, object, string } from 'zod';

export const createPostRequestSchema = object({
    title : string().min(1).max(50),
    content : string().min(1)
})
.required()
.strict()


export type CreatePostRequestType = TypeOf<typeof createPostRequestSchema> & {

    userId : number
}