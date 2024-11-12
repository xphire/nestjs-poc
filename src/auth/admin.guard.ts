import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { readFile  } from "fs/promises";
  import { UsersService } from 'src/users/users.service';
  
  @Injectable()
  export class AdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userService : UsersService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload : {sub : number} = await this.jwtService.verifyAsync(
          token,
          {
             publicKey : await readFile('./src/keys/publicKey.pem')
          }
        );
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        const user = await this.userService.getOne({id : payload.sub});

        if(!user) throw new UnauthorizedException();

        request['user'] = payload;

        return user.isAdmin
        
      } catch {
        throw new UnauthorizedException();
      }
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  