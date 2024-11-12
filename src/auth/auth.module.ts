import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';

@Module({
    imports : [UsersModule, 
    JwtModule.register({
        global : true,
        signOptions : {
            expiresIn : '1d',
            algorithm : 'RS256'
        }
    }),
    TypeOrmModule.forFeature([User])
    ],
    providers: [AuthService],
    controllers: [AuthController]
})
export class AuthModule {}
