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
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Post as PostEntity } from './entities/post.inities';
import { PostsService } from './posts.service';
import { PostPipe } from './pipe/post.pipe';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ZodValidationPipe } from './pipe/zod-validation.pipe';
import { CreatePostSchema } from './pipe/create-post.schema';
import { jwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/auth/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';

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

  @UseGuards(jwtAuthGuard) // ✅ Add this guard to authenticate the user
  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createPostData: CreatePostDto,
    @CurrentUser() user: any,
  ): Promise<PostEntity> {
    console.log('Validated data:', createPostData);
    console.log('Authenticated user:', user); // ✅ Add this for debugging
    return this.postsService.create(createPostData, user);
  }

  @UseGuards(jwtAuthGuard)
  @Put(':id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostData: UpdatePostDto,
    @CurrentUser() user: any,
  ): Promise<PostEntity | undefined> {
    return this.postsService.update(id, updatePostData, user);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.postsService.delete(id);
  }
  @Get('count/all')
  async countPosts(): Promise<{ count: number }> {
    return this.postsService.count().then((count) => ({ count }));
  }
}
