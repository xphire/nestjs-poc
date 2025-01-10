import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { JwtService } from '@nestjs/jwt';
import { CommentsService } from './comments.service';
import { UsersService } from 'src/users/users.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockFactory : any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers : [
        {
          provide : CommentsService,
          useValue : mockFactory
        },
        {
          provide : JwtService,
          useValue : mockFactory
        },
        {
          provide : UsersService,
          useValue : mockFactory
        }
      ]
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
