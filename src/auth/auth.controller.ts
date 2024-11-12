import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}


    @Post()
    async signIn(
        @Body() payload : {email : string, password : string}
    ) : Promise<{access_token : string} | null>{


        try {

            const {email, password} = payload

            return {
                "access_token" : await this.authService.signIn(email,password)
            }
            
        } catch (error) {

              console.log(error)

              throw new UnauthorizedException('unauthorized')

            
        }


    }
}
