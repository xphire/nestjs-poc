import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let mockRepository : any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers : [
        {
          provide : UsersService,
          useValue : mockRepository
        },
        {
          provide : JwtService,
          useValue : mockRepository
        },
        {
          provide : PostsService,
          useValue : mockRepository
        }
      ]

    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
