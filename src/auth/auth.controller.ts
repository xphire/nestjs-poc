import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signInRequestSchema, SignInDto } from './auth.dto';
import { ZodValidationPipe } from 'src/validation-pipe';
import { ApiOperation } from '@nestjs/swagger';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post()
    @ApiOperation({description : 'obtain auth token by supplying email and password', summary : 'obtain auth token by supplying email and password'})
    async signIn(
        @Body(new ZodValidationPipe(signInRequestSchema)) signInDto : SignInDto
    ) : Promise<{access_token : string} | null>{


        try {

            const {email, password} = signInDto

            return {
                "access_token" : await this.authService.signIn(email,password)
            }
            
        } catch (error) {

              console.log(error)

              throw new UnauthorizedException('unauthorized')

            
        }


    }
}
