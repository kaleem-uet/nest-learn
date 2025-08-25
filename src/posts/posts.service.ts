import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from './entities/post.inities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postRepository.find();
  }
  async findById(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post with the given ID not found');
    }
    return post;
  }
  async create(createPostData: CreatePostDto): Promise<Post> {
    const newPost = this.postRepository.create(createPostData);
    return this.postRepository.save(newPost);
  }
  async update(
    id: number,
    updatedPost: Partial<Post>,
  ): Promise<Post | undefined> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post with the given ID not found');
    }
    Object.assign(post, updatedPost);
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
