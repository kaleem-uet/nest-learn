import { Injectable } from '@nestjs/common';
import { Post } from './interface/interface.post';

@Injectable()
export class PostService {
  private posts: Post[] = [
    {
      id: 1,
      title: 'First Post',
      content: 'This is the content of the first post.',
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): Post[] {
    return this.posts;
  }
  findById(id: number): Post | undefined {
    return this.posts.find((post) => post.id === id);
  }
  create(post: Post): Post {
    post.id = this.posts.length + 1; // Simple ID generation
    post.createdAt = new Date();
    post.updatedAt = new Date();
    this.posts.push(post);
    return post;
  }
  update(id: number, updatedPost: Partial<Post>): Post | undefined {
    const post = this.findById(id);
    if (!post) {
      return undefined;
    }
    Object.assign(post, updatedPost, { updatedAt: new Date() });
    return post;
  }
  delete(id: number): boolean {
    const index = this.posts.findIndex((post) => post.id === id);
    if (index === -1) {
      return false;
    }
    this.posts.splice(index, 1);
    return true;
  }
  count(): number {
    return this.posts.length;
  }
  clear(): void {
    this.posts = [];
  }
}
