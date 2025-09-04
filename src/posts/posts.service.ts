// import {
//   BadRequestException,
//   Inject,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { Post } from './entities/post.inities';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { CreatePostDto } from './dto/create-post.dto';
// import { User } from 'src/auth/entities/user.entity';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';
// import { FindPostQueryDto } from './dto/find-post-query.dto';
// import { PaginatedResponse } from 'src/common/interfaces/paginated.responce.interface';
// @Injectable()
// export class PostsService {
//   private postListCacheKey: Set<string> = new Set();
//   constructor(
//     @InjectRepository(Post) private postRepository: Repository<Post>,
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//   ) {}

//   private getPostListCacheKey(query: FindPostQueryDto): string {
//     const { page = 1, limit = 10, title } = query;
//     return `posts_list_page${page}_limit${limit}_title${query.title}`;
//   }
//   async findAll(query: FindPostQueryDto): Promise<PaginatedResponse<Post>> {
//     const cacheKey = this.getPostListCacheKey(query);
//     this.postListCacheKey.add(cacheKey);
//     const cachedPosts =
//       await this.cacheManager.get<PaginatedResponse<Post>>(cacheKey);
//     if (cachedPosts) {
//       return cachedPosts;
//     }
//     const { page = 1, limit = 10, title } = query;
//     const queryBuilder = await this.postRepository
//       .createQueryBuilder('post')
//       .leftJoinAndSelect('post.author', 'author')
//       .where('post.title LIKE :title', { title: `%${title}%` })
//       .skip((page - 1) * limit)
//       .take(limit)
//       .orderBy('post.createdAt', 'DESC')
//       .getManyAndCount();

//     if (title) {
//       queryBuilder.andWhere('post.title LIKE :title', { title: `%${title}%` });
//     }
//     const { items, totalItems } = await queryBuilder.getManyAndCount();
//     const totalPages = Math.ceil(totalItems / limit);
//     const responseResult: PaginatedResponse<Post> = {
//       data: items,
//       meta: {
//         currentPage: page,
//         itemsPerPage: limit,
//         totalItems: totalItems,
//         totalPages: totalPages,
//         hasPreviousPage: page > 1,
//         hasNextPage: page < totalPages,
//       },
//     };
//     await this.cacheManager.set(cacheKey, responseResult, { ttl: 30000 });
//     return responseResult;
//   }
//   async findById(id: number): Promise<Post | null> {
//     const post = await this.postRepository.findOneBy({ id });
//     if (!post) {
//       throw new NotFoundException('Post with the given ID not found');
//     }
//     return post;
//   }
//   async create(createPostData: CreatePostDto, author: User): Promise<Post> {
//     // ✅ Add validation to ensure author exists
//     if (!author || !author.id) {
//       throw new BadRequestException(
//         'User authentication required to create a post',
//       );
//     }
//     const newPost = this.postRepository.create({
//       title: createPostData.title,
//       content: createPostData.content,
//       author, // This should set both the author relation and authorId
//     });

//     return this.postRepository.save(newPost);
//   }

//   async update(
//     id: number,
//     updatedPostData: Partial<Pick<Post, 'title' | 'content'>>,
//     user: User,
//   ): Promise<Post> {
//     // Fetch the post with the author relation
//     const post = await this.postRepository.findOne({
//       where: { id },
//       relations: ['author'],
//     });

//     if (!post) {
//       throw new NotFoundException('Post with the given ID not found');
//     }

//     // Authorization: Only author or admin can update
//     if (post.author.id !== user.id && user.role !== 'admin') {
//       throw new NotFoundException('You are not authorized to update this post');
//     }

//     // Only update allowed fields
//     if (updatedPostData.title !== undefined) {
//       post.title = updatedPostData.title;
//     }

//     if (updatedPostData.content !== undefined) {
//       post.content = updatedPostData.content;
//     }

//     return this.postRepository.save(post);
//   }

//   async delete(id: number): Promise<boolean> {
//     const post = await this.postRepository.findOneBy({ id });
//     if (!post) {
//       throw new NotFoundException('Post with the given ID not found');
//     }
//     await this.postRepository.remove(post);
//     return true;
//   }
//   async count(): Promise<number> {
//     return this.postRepository.count();
//   }
// }

import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from './entities/post.inities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/auth/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FindPostQueryDto } from './dto/find-post-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated.responce.interface';

@Injectable()
export class PostsService {
  private postListCacheKey: Set<string> = new Set();
  private postCacheKeys: Set<string> = new Set();
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getPostListCacheKey(query: FindPostQueryDto): string {
    const { page = 1, limit = 10, title } = query;
    return `posts_list_page${page}_limit${limit}_title${title || ''}`;
  }

  async findAll(query: FindPostQueryDto): Promise<PaginatedResponse<Post>> {
    const cacheKey = this.getPostListCacheKey(query);
    this.postListCacheKey.add(cacheKey);

    const cachedPosts =
      await this.cacheManager.get<PaginatedResponse<Post>>(cacheKey);
    if (cachedPosts) {
      return cachedPosts;
    }

    const { page = 1, limit = 10, title } = query;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('post.createdAt', 'DESC');

    if (title) {
      queryBuilder.andWhere('post.title LIKE :title', { title: `%${title}%` });
    }

    const [items, totalItems] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    const responseResult: PaginatedResponse<Post> = {
      data: items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };

    await this.cacheManager.set(cacheKey, responseResult, 30000);
    return responseResult;
  }

  async findById(id: number): Promise<Post | null> {
    const cacheKey = `post_${id}`;

    // Try to get from cache first
    const cachedPost = await this.cacheManager.get<Post>(cacheKey);
    if (cachedPost) {
      return cachedPost;
    }

    // If not in cache, get from database
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'], // Include author relation for complete data
    });

    if (!post) {
      throw new NotFoundException('Post with the given ID not found');
    }

    // Cache the post for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, post, 300000);
    this.postCacheKeys.add(cacheKey);

    return post;
  }

  async create(createPostData: CreatePostDto, author: User): Promise<Post> {
    // Add validation to ensure author exists
    if (!author || !author.id) {
      throw new BadRequestException(
        'User authentication required to create a post',
      );
    }

    const newPost = this.postRepository.create({
      title: createPostData.title,
      content: createPostData.content,
      author, // This should set both the author relation and authorId
    });

    const savedPost = await this.postRepository.save(newPost);

    // Clear cache when new post is created
    await this.clearPostListCache();

    return savedPost;
  }

  async update(
    id: number,
    updatedPostData: Partial<Pick<Post, 'title' | 'content'>>,
    user: User,
  ): Promise<Post> {
    // Fetch the post with the author relation
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post with the given ID not found');
    }

    // Authorization: Only author or admin can update
    if (post.author.id !== user.id && user.role !== 'admin') {
      throw new BadRequestException(
        'You are not authorized to update this post',
      );
    }

    // Only update allowed fields
    if (updatedPostData.title !== undefined) {
      post.title = updatedPostData.title;
    }

    if (updatedPostData.content !== undefined) {
      post.content = updatedPostData.content;
    }

    const updatedPost = await this.postRepository.save(post);

    // Clear cache when post is updated
    await this.clearPostListCache();

    return updatedPost;
  }

  async delete(id: number): Promise<boolean> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post with the given ID not found');
    }

    await this.postRepository.remove(post);

    // Clear cache when post is deleted
    await this.clearPostListCache();

    return true;
  }

  async count(): Promise<number> {
    return this.postRepository.count();
  }

  private async clearPostListCache(): Promise<void> {
    // Clear all cached post list entries
    const cacheKeys = Array.from(this.postListCacheKey);
    for (const key of cacheKeys) {
      await this.cacheManager.del(key);
    }
    this.postListCacheKey.clear();
  }
}
