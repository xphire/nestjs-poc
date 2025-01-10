import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './posts.entity';
import { CreatePostRequestType } from './posts.dto';

describe('PostsService', () => {
  let service: PostsService;

  const mockRepository = {
    save: async () => {},
    findOne: async () => {},
    count: async () => {},
    find: async () => {},
    findOneBy: async () => {},
    delete: async () => {},
  };

  const uuid = crypto.randomUUID();

  const post: CreatePostRequestType = {
    userId: 99,
    title: 'abc',
    content: 'abcdefghijklmnopqrstuvwxyz',
  };

  const resolvedPost: Omit<Post, 'createdAt' | 'updatedAt' | 'user'> = {
    id: 1,
    uuid,
    title: 'abcdef',
    content: 'abcdefghijklmnop',
    userId: 99,
    comments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create post service tests', () => {
    test('should create a post', async () => {
      mockRepository.save = jest.fn().mockResolvedValue(resolvedPost);

      expect(await service.create(post)).toEqual(resolvedPost);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);

      expect(mockRepository.save).toHaveBeenCalledWith(post);
    });

    test('should rethrow error thrown by post repository', async () => {
      const errorMsg = 'error connecting to DB';
      mockRepository.save = jest.fn().mockRejectedValue(new Error(errorMsg));

      await expect(service.create(post)).rejects.toThrow(errorMsg);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);

      expect(mockRepository.save).toHaveBeenCalledWith(post);
    });
  });

  describe('getOne service tests', () => {
    const id = 99;

    test('should return a post when id is passed', async () => {
      mockRepository.findOne = jest.fn().mockResolvedValue(resolvedPost);

      expect(await service.getOne({ id })).toEqual(resolvedPost);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
    });

    test('should return a post when uuid is passed', async () => {
      mockRepository.findOne = jest.fn().mockResolvedValue(resolvedPost);

      expect(await service.getOne({ uuid })).toEqual(resolvedPost);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          uuid,
        },
      });
    });

    test('should throw an error when neither uuid or id is passed', async () => {
      await expect(service.getOne({})).rejects.toThrow('invalid query');

      expect(mockRepository.findOne).toHaveBeenCalledTimes(0);
    });

    test('should throw an error when an error is thrown by the repository', async () => {
      const errorMessage = 'random error';

      mockRepository.findOne = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(service.getOne({ id, uuid })).rejects.toThrow(errorMessage);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    test('should return null when gets repository returns null', async () => {
      mockRepository.findOne = jest.fn().mockResolvedValue(null);

      expect(await service.getOne({ id, uuid })).toBeNull();

      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
    });
  });
});
