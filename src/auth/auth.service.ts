import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { readFile  } from "fs/promises";
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {

    constructor(
        private usersService : UsersService,
        private jwtService : JwtService,
        @InjectRepository(User)
        private usersRepository : Repository<User> )
    {}


    async signIn(email : string , password : string) : Promise<any>{


       // const user = await this.usersService.getOne({email})

       //usersService was ditched for usersRespository as we do not return password from userService

       const user = await this.usersRepository.findOneBy({email})

        if(!user){

            throw new UnauthorizedException('unauthorized')
        }

        await argon2.verify(user.password, password)

        const payload  = {

            sub : user.id,
           
        }
        
        return await this.jwtService.signAsync(payload,{

            privateKey : await readFile('./src/keys/privateKey.pem'),

        })

    }
}
