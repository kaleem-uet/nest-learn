import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from './entities/post.inities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/auth/entities/user.entity';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }
  async findById(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post with the given ID not found');
    }
    return post;
  }
  async create(createPostData: CreatePostDto, author: User): Promise<Post> {
    // ✅ Add validation to ensure author exists
    if (!author || !author.id) {
      throw new BadRequestException(
        'User authentication required to create a post',
      );
    }

    console.log('Creating post with author:', author); // Debug log

    const newPost = this.postRepository.create({
      title: createPostData.title,
      content: createPostData.content,
      author, // This should set both the author relation and authorId
    });

    return this.postRepository.save(newPost);
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
      throw new NotFoundException('You are not authorized to update this post');
    }

    // Only update allowed fields
    if (updatedPostData.title !== undefined) {
      post.title = updatedPostData.title;
    }

    if (updatedPostData.content !== undefined) {
      post.content = updatedPostData.content;
    }

    return this.postRepository.save(post);
  }

  async delete(id: number): Promise<boolean> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post with the given ID not found');
    }
    await this.postRepository.remove(post);
    return true;
  }
  async count(): Promise<number> {
    return this.postRepository.count();
  }
}
