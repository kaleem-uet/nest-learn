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
  UsePipes,
} from '@nestjs/common';
import { Post as PostEntity } from './entities/post.inities';
import { PostsService } from './posts.service';
import { PostPipe } from './pipe/post.pipe';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ZodValidationPipe } from './pipe/zod-validation.pipe';
import { CreatePostSchema } from './pipe/create-post.schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getAllPosts(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Get(':id')
  async getPostById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostEntity | null> {
    return this.postsService.findById(id);
  }

  @HttpPost()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreatePostSchema))
  async createPost(@Body() createPostData: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(createPostData);
  }
  @Put(':id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostData: UpdatePostDto,
  ): Promise<PostEntity | undefined> {
    return this.postsService.update(id, updatePostData);
  }

  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.postsService.delete(id);
  }
  @Get('count/all')
  async countPosts(): Promise<{ count: number }> {
    return this.postsService.count().then((count) => ({ count }));
  }
}
