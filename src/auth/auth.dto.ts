import { object, string, z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const signInRequestSchema = object({
    email : string().email(),
    password : string().min(1)
})
.strict()


export class SignInDto implements z.infer<typeof signInRequestSchema>{

    @ApiProperty()
    email! : string
    @ApiProperty()
    password! : string

}