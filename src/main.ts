import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import  helmet,{hidePoweredBy} from 'helmet'


export interface UserRequest extends Request {
  user: {
    sub: number;
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.use(helmet())

  app.use(hidePoweredBy())

  const config = new DocumentBuilder()
    .setTitle('Blogify APP Backend APIs')
    .setDescription('The APIs for Blogify ')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config,{

    ignoreGlobalPrefix : false,
    include : [AuthModule,UsersModule,PostsModule,CommentsModule]
  });

  SwaggerModule.setup('documentation', app, documentFactory, {

     useGlobalPrefix : true
  });
 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
