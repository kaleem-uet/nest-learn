import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post as HttpPost,
  Param,
  ParseIntPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './interface/interface.post';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getAllPosts() {
    return this.postService.findAll();
  }

  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findById(id);
  }

  @HttpPost()
  @HttpCode(HttpStatus.CREATED)
  createPost(
    @Body() createPostData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    // Get the latest post to determine the next id
    const posts = this.postService.findAll();
    const nextId =
      posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1;

    const newPost: Post = {
      ...createPostData,
      id: nextId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.postService.create(newPost);
  }
  @Put(':id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostData: Partial<Post>,
  ) {
    return this.postService.update(id, updatePostData);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.delete(id);
  }
  @Get('count/all')
  countPosts() {
    return { count: this.postService.count() };
  }
}
