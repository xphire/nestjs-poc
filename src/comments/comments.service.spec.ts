import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { Post } from '../posts/posts.entity';

describe('CommentsService', () => {
  let service: CommentsService;

  const user = { userId: 5 };

  const mockRepository = {
    findOne: async () => {},
    save: async () => {},
    count: async () => {},
    find: async () => {},
    delete: async () => {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('happy paths', () => {});

  test('create', async () => {
    const comment = { postId: 5, userId: user.userId, content: 'content' };
    mockRepository.save = jest.fn().mockResolvedValue(comment);

    const post = { id: 55 };
    mockRepository.findOne = jest.fn().mockResolvedValue(post);

    expect(await service.create(comment)).toEqual(comment);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: comment.postId,
      },
    });
    expect(await mockRepository.findOne()).toEqual(post);
  });

  test('getOne', async () => {
    const comment = { id: 5 };
    mockRepository.findOne = jest.fn().mockResolvedValue(comment);

    expect(await service.getOne(comment)).toEqual(comment);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: comment.id,
      },
    });
  });

  test('getMany', async () => {
    const comments = [{ id: 5 }, { id: 10 }];
    mockRepository.count = jest.fn().mockResolvedValue(comments.length);
    mockRepository.find = jest.fn().mockResolvedValue(comments);

    expect(await service.getMany(user)).toEqual({
      count: comments.length,
      comments: comments,
    });

    expect(mockRepository.count).toHaveBeenCalledWith({
      where: {
        userId: user.userId,
      },
    });

    expect(mockRepository.find).toHaveBeenCalledWith({
      skip: 0,
      take: 5,
      where: {
        userId: user.userId,
      },
    });
  });

  test('remove', async () => {
    const comment = { id: 5 };
    const deleteResult = { affected: 1 };
    mockRepository.delete = jest.fn().mockResolvedValue(deleteResult);
    service.getOne = jest.fn().mockResolvedValue(comment);

    expect(await service.getOne(comment)).toEqual(comment);

    expect(await service.remove(comment)).toEqual(deleteResult);
  });

  describe('unhappy paths', () => {
    test('create', async () => {
      const comment = { postId: 5, userId: user.userId, content: 'content' };

      const errorMsg = 'invalid post';

      mockRepository.findOne = jest.fn().mockResolvedValue(null);

      try {
        await service.create(comment);
      } catch (error: any) {
        expect(error.message).toEqual(errorMsg);

        expect(mockRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: comment.postId,
          },
        });
      }
    });

    test('getOne', async () => {
      try {
        await service.getOne({});
      } catch (error: any) {
        expect(error.message).toEqual('invalid query');
      }
    });

    test('getOne', async () => {
      const query = { id: 5 };

      mockRepository.findOne = jest.fn().mockResolvedValue(null);

      expect(await service.getOne(query)).toBeNull();

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: query.id,
        },
      });
    });

    test('getOne', async () => {
      const query = { uuid: '5' };

      mockRepository.findOne = jest.fn().mockResolvedValue(null);

      expect(await service.getOne(query)).toBeNull();

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          uuid: query.uuid,
        },
      });
    });

    test('remove', async () => {
      const query = { id: 5, uuid: '5' };

      try {
        service.getOne = jest.fn().mockResolvedValue(null);

        await service.remove(query);
      } catch (error: any) {
        expect(error.message).toEqual('failed to retrieve comment to be deleted');

        expect(service.getOne).toHaveBeenCalledWith(query);

        expect(service.getOne).toHaveBeenCalledTimes(1);
      }
    });
  });
});
