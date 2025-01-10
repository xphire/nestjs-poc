import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { CommentsModule } from 'src/comments/comments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/posts/posts.entity';
import { User } from 'src/users/users.entity';
import { Comment } from 'src/comments/comments.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        UsersModule,
        AuthModule,
        PostsModule,
        CommentsModule,
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'test',
            password: 'testUserWithDB12345',
            database: 'first_nest_dev_test_e2e',
            entities: [User, Post, Comment],
            synchronize: true,
            dropSchema: true,
        })
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    app.setGlobalPrefix('api/v1');
  });

  afterAll((done) => {
    app.close();
    done();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  it('/users/user (POST) should create user', async () => {
    return request(app.getHttpServer())
      .post('/users/user')
      .send({
        email: 'admin@ktech.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'yuukqwkwpu99F#',
        isAdmin: true,
      })
      .set('Accept', 'application/json')
      .expect(201)
      .then(response => {
        expect(response.body).toHaveProperty('id')
      })
  });
});
